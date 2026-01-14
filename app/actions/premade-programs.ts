'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createProgram } from './programs'
import { createWorkout } from './workouts'
import { PREMADE_PROGRAMS } from '@/lib/data/premade-programs'

/**
 * Copy a premade program to user's account
 * This creates a new program from the hardcoded premade programs data
 */
export async function copyPremadeProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Extract index from programId (format: premade-0, premade-1, etc.)
  const index = parseInt(programId.split('-')[1])
  const premadeProgram = PREMADE_PROGRAMS[index]
  
  if (!premadeProgram) {
    throw new Error('Premade program not found')
  }

  // Create new program for user
  const formData = new FormData()
  formData.append('name', premadeProgram.name)
  formData.append('description', premadeProgram.description || '')
  formData.append('is_active', 'true')

  const newProgram = (await createProgram(formData)) as { 
    id: string
    name: string
    description: string | null
  }

  if (!newProgram?.id) {
    throw new Error('Failed to create program')
  }

  const createdWorkouts = []

  // Copy all workouts and their exercises
  for (const workout of premadeProgram.workouts) {
    const workoutFormData = new FormData()
    workoutFormData.append('program_id', newProgram.id)
    workoutFormData.append('name', workout.name)
    workoutFormData.append('description', workout.description || '')
    workoutFormData.append('order_index', workout.order_index?.toString() || '0')

    const newWorkout = (await createWorkout(workoutFormData)) as {
      id: string
      name: string
      description: string | null
      program_id: string
    }

    if (!newWorkout?.id) {
      console.error(`Failed to create workout "${workout.name}"`)
      continue
    }

    createdWorkouts.push(newWorkout)

    // Copy exercises to the new workout
    for (const exerciseData of workout.exercises) {
      // Check if user already has this custom exercise
      const existingCheck = supabase.from('exercises') as any
      const { data: existing } = await existingCheck
        .select('id')
        .eq('user_id', user.id)
        .eq('name', exerciseData.name)
        .single()

      let exerciseId: string

      if (existing) {
        exerciseId = existing.id
      } else {
        // Create custom exercise for user
        const exerciseQuery = supabase.from('exercises') as any
        const { data: newExercise, error: exerciseError } = await exerciseQuery
          .insert({
            user_id: user.id,
            name: exerciseData.name,
            muscle_groups: exerciseData.muscleGroups || null,
            equipment: exerciseData.equipment || null,
            is_custom: true,
          })
          .select()
          .single()
        
        if (exerciseError) {
          console.error(`Error creating exercise ${exerciseData.name}:`, exerciseError)
          continue
        }

        exerciseId = newExercise.id
      }

      // Link exercise to workout
      const linkQuery = supabase.from('workout_exercises') as any
      const { error: linkError } = await linkQuery.insert({
        workout_id: newWorkout.id,
        exercise_id: exerciseId,
        order_index: exerciseData.order_index || 0,
        sets: null,
        reps: null,
      })

      if (linkError) {
        console.error(`Error linking exercise to workout:`, linkError)
        continue
      }
    }
  }
  
  if (createdWorkouts.length === 0) {
    throw new Error('Failed to create any workouts for the program')
  }

  revalidatePath('/programs')
  return { success: true, programId: newProgram.id }
}

/**
 * Get all premade programs from hardcoded data
 */
export async function getPremadePrograms() {
  // Return hardcoded premade programs with generated IDs (no database needed)
  return PREMADE_PROGRAMS.map((program, idx) => ({
    id: `premade-${idx}`,
    name: program.name,
    description: program.description,
    workouts: program.workouts.map((workout, widx) => ({
      id: `premade-${idx}-workout-${widx}`,
      name: workout.name,
      description: workout.description || null,
      order_index: workout.order_index,
    })),
  }))
}
