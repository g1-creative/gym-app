'use server'

import { createClient } from '@/lib/supabase/server'
import { PREMADE_PROGRAMS } from '@/lib/data/premade-programs'

/**
 * Seed premade programs into the database
 * This should be run once to populate premade programs
 * Can be called from an admin page or setup script
 */
export async function seedPremadePrograms() {
  const supabase = await createClient()
  
  // Check if user is admin (you can customize this check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const results = []

  for (const program of PREMADE_PROGRAMS) {
    try {
      // Check if program already exists
      const { data: existing } = await supabase
        .from('programs')
        .select('id')
        .eq('name', program.name)
        .eq('is_premade', true)
        .is('deleted_at', null)
        .maybeSingle()

      if (existing) {
        console.log(`Program "${program.name} already exists, skipping...`)
        continue
      }

      // Create program
      const { data: newProgram, error: programError } = await supabase
        .from('programs')
        .insert({
          user_id: null, // Premade programs have no owner
          name: program.name,
          description: program.description,
          is_premade: true,
          is_active: true,
        })
        .select()
        .single()

      if (programError) {
        console.error(`Error creating program "${program.name}":`, programError)
        continue
      }

      // Create workouts
      for (const workout of program.workouts) {
        const { data: newWorkout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            program_id: newProgram.id,
            name: workout.name,
            description: workout.description || null,
            order_index: workout.order_index,
            rest_timer_seconds: workout.rest_timer_seconds,
          })
          .select()
          .single()

        if (workoutError) {
          console.error(`Error creating workout "${workout.name}":`, workoutError)
          continue
        }

        // Create exercises for workout
        for (const exerciseData of workout.exercises) {
          // Find or create exercise
          let exerciseId: string | null = null

          // Try to find existing exercise
          const { data: existingExercise } = await supabase
            .from('exercises')
            .select('id')
            .eq('name', exerciseData.name)
            .eq('is_custom', exerciseData.isCustom || false)
            .is('deleted_at', null)
            .maybeSingle()

          if (existingExercise) {
            exerciseId = existingExercise.id
          } else {
            // Create new exercise
            const { data: newExercise, error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                user_id: null, // Public exercises
                name: exerciseData.name,
                muscle_groups: exerciseData.muscleGroups || null,
                equipment: exerciseData.equipment || null,
                is_custom: exerciseData.isCustom || false,
              })
              .select()
              .single()

            if (exerciseError) {
              console.error(`Error creating exercise "${exerciseData.name}":`, exerciseError)
              continue
            } else {
              exerciseId = newExercise.id
            }
          }

          if (exerciseId) {
            // Link exercise to workout
            await supabase
              .from('workout_exercises')
              .insert({
                workout_id: newWorkout.id,
                exercise_id: exerciseId,
                order_index: exerciseData.order_index,
                rest_timer_seconds: exerciseData.rest_timer_seconds || workout.rest_timer_seconds,
                notes: exerciseData.notes || null,
              })
          }
        }
      }

      results.push({ success: true, program: program.name })
    } catch (error) {
      console.error(`Error seeding program "${program.name}":`, error)
      results.push({ success: false, program: program.name, error: String(error) })
    }
  }

  return results
}

