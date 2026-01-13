'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createProgram } from './programs'
import { createWorkout } from './workouts'

/**
 * Copy a premade program to user's account
 * This creates a new program owned by the user with all workouts and exercises
 */
export async function copyPremadeProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Get the premade program with workouts and exercises
  const { data: premadeProgram, error: programError } = await supabase
    .from('programs')
    .select(`
      *,
      workouts(
        *,
        workout_exercises(
          *,
          exercise:exercises(*)
        )
      )
    `)
    .eq('id', programId)
    .eq('is_premade', true)
    .is('deleted_at', null)
    .single()

  if (programError || !premadeProgram) {
    throw new Error('Premade program not found')
  }

  // Create new program for user
  const formData = new FormData()
  formData.append('name', `${premadeProgram.name} (Copy)`)
  formData.append('description', premadeProgram.description || '')
  formData.append('is_active', 'true')

  const newProgram = await createProgram(formData)

  // Copy workouts
  const workouts = premadeProgram.workouts || []
  for (const workout of workouts) {
    const workoutFormData = new FormData()
    workoutFormData.append('program_id', newProgram.id)
    workoutFormData.append('name', workout.name)
    workoutFormData.append('description', workout.description || '')
    workoutFormData.append('order_index', workout.order_index?.toString() || '0')
    workoutFormData.append('rest_timer_seconds', workout.rest_timer_seconds?.toString() || '90')

    const newWorkout = await createWorkout(workoutFormData)

    // Copy workout exercises
    const workoutExercises = workout.workout_exercises || []
    for (const we of workoutExercises) {
      // First, ensure the exercise exists (create if custom, or use existing)
      let exerciseId = we.exercise?.id
      
      if (we.exercise?.is_custom) {
        // Create custom exercise for user
        const { data: newExercise } = await supabase
          .from('exercises')
          .insert({
            user_id: user.id,
            name: we.exercise.name,
            muscle_groups: we.exercise.muscle_groups,
            equipment: we.exercise.equipment,
            is_custom: true,
          })
          .select()
          .single()
        
        if (newExercise) {
          exerciseId = newExercise.id
        }
      }

      if (exerciseId) {
        // Create workout_exercise link
        await supabase
          .from('workout_exercises')
          .insert({
            workout_id: newWorkout.id,
            exercise_id: exerciseId,
            order_index: we.order_index || 0,
            rest_timer_seconds: we.rest_timer_seconds,
            notes: we.notes,
          })
      }
    }
  }

  revalidatePath('/programs')
  return newProgram
}

/**
 * Get all premade programs
 */
export async function getPremadePrograms() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      workouts(
        id,
        name,
        description,
        order_index
      )
    `)
    .eq('is_premade', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

