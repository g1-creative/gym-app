'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sessionSchema = z.object({
  program_id: z.string().uuid().optional().nullable(),
  workout_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export async function createSession(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    program_id: formData.get('program_id') as string | null,
    workout_id: formData.get('workout_id') as string | null,
    notes: formData.get('notes') as string | null,
  }

  const validated = sessionSchema.parse(rawData)

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      ...validated,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  return data
}

export async function completeSession(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get session start time
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) throw new Error('Session not found')

  const startedAt = new Date(session.started_at)
  const completedAt = new Date()
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: completedAt.toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  revalidatePath('/history')
  return data
}

export async function getActiveSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      sets(
        *,
        exercise:exercises(*)
      ),
      program:programs(*),
      workout:workouts(*)
    `)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getSession(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      sets(
        *,
        exercise:exercises(*)
      ),
      program:programs(*),
      workout:workouts(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function getSessions(limit = 50) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      program:programs(name),
      workout:workouts(name)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

