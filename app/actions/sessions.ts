'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sessionSchema = z.object({
  program_id: z.string().uuid().optional().nullable(),
  workout_id: z.string().uuid().optional().nullable(),
  workout_day_number: z.number().int().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export async function createSession(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    program_id: formData.get('program_id') as string | null,
    workout_id: formData.get('workout_id') as string | null,
    workout_day_number: formData.get('workout_day_number') ? parseInt(formData.get('workout_day_number') as string) : null,
    notes: formData.get('notes') as string | null,
  }

  const validated = sessionSchema.parse(rawData)

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const insertData = {
    user_id: user.id,
    ...validated,
    started_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  return data
}

export async function updateSession(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    notes: formData.get('notes') as string | null,
  }

  const validated = sessionSchema.partial().parse(rawData)

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const updateQuery = supabase.from('workout_sessions') as any
  const { data, error } = await updateQuery
    .update(validated)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/workout/active')
  return data
}

export async function completeSession(id: string) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5f93ed16-d6e4-40d6-abc2-24ebc8a0a056',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sessions.ts:46',message:'completeSession entry',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5f93ed16-d6e4-40d6-abc2-24ebc8a0a056',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sessions.ts:50',message:'user auth check',data:{hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  if (!user) throw new Error('Unauthorized')

  // Get session start time
  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  // Cast the query builder to bypass type checking for partial selects
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5f93ed16-d6e4-40d6-abc2-24ebc8a0a056',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sessions.ts:54',message:'before query - query params',data:{id,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  const selectQuery = supabase.from('workout_sessions') as any
  const result = await selectQuery
    .select('started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  const session = result.data as { started_at: string } | null

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5f93ed16-d6e4-40d6-abc2-24ebc8a0a056',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sessions.ts:63',message:'after query - session data',data:{hasSession:!!session,sessionType:typeof session,sessionKeys:session?Object.keys(session):null,sessionStartedAt:session?.started_at},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  if (!session) throw new Error('Session not found')

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5f93ed16-d6e4-40d6-abc2-24ebc8a0a056',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sessions.ts:66',message:'before accessing started_at',data:{sessionExists:!!session,hasStartedAt:'started_at' in (session||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  const startedAt = new Date(session.started_at)
  const completedAt = new Date()
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const updateQuery = supabase.from('workout_sessions') as any
  const { data, error } = await updateQuery
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
  revalidatePath('/')
  return data
}

export async function getActiveSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workout_sessions') as any
  const result = await query
    .select(`
      *,
      sets(
        *,
        exercise:exercises(*)
      ),
      program:programs(*),
      workout:workouts(
        *,
        workout_exercises(
          *,
          exercise:exercises(*)
        )
      )
    `)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = result
  if (error) throw error
  return data
}

export async function getSession(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workout_sessions') as any
  const result = await query
    .select(`
      *,
      sets(
        *,
        exercise:exercises(*)
      ),
      program:programs(*),
      workout:workouts(
        *,
        workout_exercises(
          *,
          exercise:exercises(*)
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  const { data, error } = result
  if (error) throw error
  return data
}

export async function getSessions(limit = 50) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workout_sessions') as any
  const result = await query
    .select(`
      *,
      program:programs(name),
      workout:workouts(name)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  const { data, error } = result
  if (error) throw error
  return data
}

export async function getSessionsForWorkout(workoutId: string, limit = 10) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workout_sessions') as any
  const result = await query
    .select(`
      *,
      program:programs(name),
      workout:workouts(name)
    `)
    .eq('user_id', user.id)
    .eq('workout_id', workoutId)
    .not('completed_at', 'is', null)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  const { data, error } = result
  if (error) throw error
  return data || []
}

/**
 * Get the next workout day number for a workout
 * This calculates which iteration/cycle the user is on
 */
export async function getNextWorkoutDayNumber(workoutId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const query = supabase.from('workout_sessions') as any
  const result = await query
    .select('workout_day_number')
    .eq('user_id', user.id)
    .eq('workout_id', workoutId)
    .not('workout_day_number', 'is', null)
    .is('deleted_at', null)
    .order('workout_day_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = result
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  
  // If no previous sessions, start at day 1
  if (!data || !data.workout_day_number) {
    return 1
  }
  
  // Return next day number
  return (data.workout_day_number || 0) + 1
}

