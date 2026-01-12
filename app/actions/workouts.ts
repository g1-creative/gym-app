'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const workoutSchema = z.object({
  program_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  order_index: z.number().int().optional(),
  rest_timer_seconds: z.number().int().min(0).max(600).optional(),
})

export async function createWorkout(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    program_id: formData.get('program_id') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    order_index: formData.get('order_index') ? parseInt(formData.get('order_index') as string) : 0,
    rest_timer_seconds: formData.get('rest_timer_seconds') ? parseInt(formData.get('rest_timer_seconds') as string) : 90,
  }

  const validated = workoutSchema.parse(rawData)

  // Verify program belongs to user
  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('id', validated.program_id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!program) throw new Error('Program not found')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const { data, error } = await supabase
    .from('workouts')
    .insert(validated as any)
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/programs/${validated.program_id}`)
  return data
}

export async function updateWorkout(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    order_index: formData.get('order_index') ? parseInt(formData.get('order_index') as string) : undefined,
    rest_timer_seconds: formData.get('rest_timer_seconds') ? parseInt(formData.get('rest_timer_seconds') as string) : undefined,
  }

  const validated = workoutSchema.partial().parse(rawData)

  // Verify workout belongs to user's program
  const { data: workout } = await supabase
    .from('workouts')
    .select('program_id, programs!inner(user_id)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!workout || (workout.programs as any).user_id !== user.id) {
    throw new Error('Workout not found')
  }

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workouts') as any
  const { data, error } = await query
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/programs/${workout.program_id}`)
  return data
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: workout } = await supabase
    .from('workouts')
    .select('program_id, programs!inner(user_id)')
    .eq('id', id)
    .single()

  if (!workout || (workout.programs as any).user_id !== user.id) {
    throw new Error('Workout not found')
  }

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workouts') as any
  const { error } = await query
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  revalidatePath(`/programs/${workout.program_id}`)
}

export async function getWorkout(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      programs!inner(user_id),
      workout_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error

  // Verify ownership
  if ((data.programs as any).user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  return data
}

