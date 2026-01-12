'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SetInput } from '@/types'

const setSchema = z.object({
  session_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  workout_exercise_id: z.string().uuid().optional().nullable(),
  set_number: z.number().int().min(1),
  weight: z.number().min(0).max(1000).optional().nullable(),
  reps: z.number().int().min(0).max(1000).optional().nullable(),
  rpe: z.number().min(1).max(10).optional().nullable(),
  tempo: z.string().max(20).optional().nullable(),
  rest_seconds: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export async function logSet(input: SetInput & { sessionId: string; exerciseId: string; workoutExerciseId?: string | null }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify session belongs to user
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('id', input.sessionId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!session) throw new Error('Session not found')

  // Get next set number
  const { data: existingSets } = await supabase
    .from('sets')
    .select('set_number')
    .eq('session_id', input.sessionId)
    .eq('exercise_id', input.exerciseId)
    .is('deleted_at', null)
    .order('set_number', { ascending: false })
    .limit(1)

  const setNumber = existingSets && existingSets.length > 0 ? existingSets[0].set_number + 1 : 1

  const validated = setSchema.parse({
    session_id: input.sessionId,
    exercise_id: input.exerciseId,
    workout_exercise_id: input.workoutExerciseId || null,
    set_number: setNumber,
    weight: input.weight,
    reps: input.reps,
    rpe: input.rpe,
    tempo: input.tempo,
    rest_seconds: null, // Will be set by rest timer
    notes: input.notes,
  })

  const { data, error } = await supabase
    .from('sets')
    .insert(validated)
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  return data
}

export async function updateSet(id: string, input: Partial<SetInput>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify set belongs to user's session
  const { data: set } = await supabase
    .from('sets')
    .select('session_id, workout_sessions!inner(user_id)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!set || (set.workout_sessions as any).user_id !== user.id) {
    throw new Error('Set not found')
  }

  const validated = setSchema.partial().parse(input)

  const { data, error } = await supabase
    .from('sets')
    .update(validated)
    .eq('id', id)
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  return data
}

export async function deleteSet(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify set belongs to user's session
  const { data: set } = await supabase
    .from('sets')
    .select('session_id, workout_sessions!inner(user_id)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!set || (set.workout_sessions as any).user_id !== user.id) {
    throw new Error('Set not found')
  }

  const { error } = await supabase
    .from('sets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/workout/active')
}

export async function getSetsForExercise(exerciseId: string, sessionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('session_id', sessionId)
    .eq('exercise_id', exerciseId)
    .is('deleted_at', null)
    .order('set_number', { ascending: true })

  if (error) throw error
  return data
}

