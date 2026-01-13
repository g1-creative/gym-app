'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('programs') as any
  const result = await query
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

  const { data, error: programError } = result

  if (programError || !data) {
    throw new Error('Premade program not found')
  }

  // Type assertion for the premade program structure
  const premadeProgram = data as {
    id: string
    name: string
    description: string | null
    workouts?: Array<{
      id: string
      name: string
      description: string | null
      order_index: number
      rest_timer_seconds: number
      workout_exercises?: Array<{
        id: string
        order_index: number
        rest_timer_seconds: number | null
        notes: string | null
        exercise?: {
          id: string
          name: string
          is_custom: boolean
          muscle_groups: string[] | null
          equipment: string | null
        }
      }>
    }>
  }

  // Create new program for user
  const formData = new FormData()
  formData.append('name', `${premadeProgram.name} (Copy)`)
  formData.append('description', premadeProgram.description || '')
  formData.append('is_active', 'true')

  const newProgram = await createProgram(formData) as { id: string; name: string; description: string | null }

  // Copy workouts
  const workouts = premadeProgram.workouts || []
  const createdWorkouts = []
  
  for (const workout of workouts) {
    try {
      const workoutFormData = new FormData()
      workoutFormData.append('program_id', newProgram.id)
      workoutFormData.append('name', workout.name)
      workoutFormData.append('description', workout.description || '')
      workoutFormData.append('order_index', workout.order_index?.toString() || '0')
      workoutFormData.append('rest_timer_seconds', workout.rest_timer_seconds?.toString() || '90')

      const newWorkout = await createWorkout(workoutFormData) as { id: string; name: string; description: string | null; program_id: string }
      
      if (!newWorkout || !newWorkout.id) {
        console.error(`Failed to create workout: ${workout.name}`)
        continue
      }

      createdWorkouts.push(newWorkout)

      // Copy workout exercises
      const workoutExercises = workout.workout_exercises || []
      for (const we of workoutExercises) {
        try {
          // First, ensure the exercise exists (create if custom, or use existing)
          let exerciseId = we.exercise?.id
          
          if (!exerciseId && we.exercise?.name) {
            // Try to find existing exercise by name
            const findExerciseQuery = supabase.from('exercises') as any
            const { data: existingExercise } = await findExerciseQuery
              .select('id')
              .eq('name', we.exercise.name)
              .is('deleted_at', null)
              .maybeSingle()
            
            if (existingExercise) {
              exerciseId = existingExercise.id
            }
          }
          
          if (we.exercise?.is_custom && !exerciseId) {
            // Create custom exercise for user
            // Type assertion needed due to Supabase TypeScript inference limitations with SSR
            const exerciseQuery = supabase.from('exercises') as any
            const { data: newExercise, error: exerciseError } = await exerciseQuery
              .insert({
                user_id: user.id,
                name: we.exercise.name,
                muscle_groups: we.exercise.muscle_groups,
                equipment: we.exercise.equipment,
                is_custom: true,
              })
              .select()
              .single()
            
            if (exerciseError) {
              console.error(`Error creating exercise ${we.exercise.name}:`, exerciseError)
              continue
            }
            
            if (newExercise) {
              exerciseId = newExercise.id
            }
          }

          if (exerciseId) {
            // Create workout_exercise link
            // Type assertion needed due to Supabase TypeScript inference limitations with SSR
            const workoutExerciseQuery = supabase.from('workout_exercises') as any
            const { error: weError } = await workoutExerciseQuery
              .insert({
                workout_id: newWorkout.id,
                exercise_id: exerciseId,
                order_index: we.order_index || 0,
                rest_timer_seconds: we.rest_timer_seconds,
                notes: we.notes,
              })
            
            if (weError) {
              console.error(`Error linking exercise to workout:`, weError)
            }
          } else {
            console.warn(`No exercise ID found for: ${we.exercise?.name || 'unknown'}`)
          }
        } catch (exerciseError) {
          console.error(`Error processing exercise in workout ${workout.name}:`, exerciseError)
          // Continue with next exercise
        }
      }
    } catch (workoutError) {
      console.error(`Error creating workout ${workout.name}:`, workoutError)
      // Continue with next workout
    }
  }
  
  if (createdWorkouts.length === 0) {
    throw new Error('Failed to create any workouts for the program')
  }

  // Revalidate and redirect to programs list
  revalidatePath('/programs')
  redirect('/programs')
}

/**
 * Get all premade programs
 */
export async function getPremadePrograms() {
  const supabase = await createClient()

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('programs') as any
  const result = await query
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

  const { data, error } = result

  if (error) {
    console.error('Error fetching premade programs:', error)
    // If column doesn't exist, return empty array (migration not run)
    if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
      console.warn('is_premade column may not exist. Please run the migration.')
      return []
    }
    throw error
  }
  return data || []
}

