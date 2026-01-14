'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const programSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
})

export async function createProgram(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    is_active: formData.get('is_active') === 'true',
  }

  const validated = programSchema.parse(rawData)

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  const insertData = {
    user_id: user.id,
    ...validated,
  }

  const { data, error } = await supabase
    .from('programs')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/programs')
  return data
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    is_active: formData.get('is_active') === 'true',
  }

  const validated = programSchema.partial().parse(rawData)

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  // Cast the query builder to bypass type checking
  const query = supabase.from('programs') as any
  const { data, error } = await query
    .update(validated)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/programs')
  revalidatePath(`/programs/${id}`)
  return data
}

export async function deleteProgram(id: string) {
  try {
    const supabase = await createClient()

    // Step 1: Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[DELETE PROGRAM] Auth error:', authError)
      throw new Error('Unauthorized: User not authenticated')
    }

    console.log(`[DELETE PROGRAM] Starting deletion for program ${id} by user ${user.id}`)

    // Step 2: Verify the program exists and belongs to the user
    const verifyQuery = supabase.from('programs') as any
    const { data: existingProgram, error: verifyError } = await verifyQuery
      .select('id, user_id, name, is_premade')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (verifyError) {
      console.error('[DELETE PROGRAM] Verify error:', {
        error: verifyError,
        code: verifyError.code,
        message: verifyError.message,
        details: verifyError.details,
        hint: verifyError.hint,
        programId: id,
        userId: user.id
      })
      throw new Error(`Program not found or you do not have permission to delete it: ${verifyError.message}`)
    }

    if (!existingProgram) {
      console.error('[DELETE PROGRAM] Program not found:', { programId: id, userId: user.id })
      throw new Error('Program not found or you do not have permission to delete it')
    }

    // Prevent deletion of premade programs
    if (existingProgram.is_premade) {
      console.error('[DELETE PROGRAM] Attempted to delete premade program:', { programId: id, programName: existingProgram.name })
      throw new Error('Cannot delete premade programs')
    }

    console.log(`[DELETE PROGRAM] Program verified: ${existingProgram.name}`)

    // Step 3: Soft delete all associated workout_sessions
    const sessionsQuery = supabase.from('workout_sessions') as any
    const { error: sessionsError, data: deletedSessions } = await sessionsQuery
      .update({ deleted_at: new Date().toISOString() })
      .eq('program_id', id)
      .is('deleted_at', null)
      .select('id')

    if (sessionsError) {
      console.error('[DELETE PROGRAM] Error deleting workout sessions:', {
        error: sessionsError,
        programId: id
      })
      // Continue with deletion even if session deletion fails
    } else {
      console.log(`[DELETE PROGRAM] Soft deleted ${deletedSessions?.length || 0} workout sessions`)
    }

    // Step 4: Soft delete all associated workouts (and their workout_exercises via cascade)
    const workoutsQuery = supabase.from('workouts') as any
    const { error: workoutsError, data: deletedWorkouts } = await workoutsQuery
      .update({ deleted_at: new Date().toISOString() })
      .eq('program_id', id)
      .is('deleted_at', null)
      .select('id')

    if (workoutsError) {
      console.error('[DELETE PROGRAM] Error deleting workouts:', {
        error: workoutsError,
        code: workoutsError.code,
        message: workoutsError.message,
        details: workoutsError.details,
        programId: id
      })
      // Continue with program deletion even if workout deletion fails
    } else {
      console.log(`[DELETE PROGRAM] Soft deleted ${deletedWorkouts?.length || 0} workouts`)
    }

    // Step 5: Soft delete the program
    // Note: We only filter by id here - RLS policy will ensure user owns the program
    // Adding .eq('user_id', user.id) can sometimes conflict with RLS policy evaluation
    const programQuery = supabase.from('programs') as any
    const { error: deleteError } = await programQuery
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('[DELETE PROGRAM] Error deleting program:', {
        error: deleteError,
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        programId: id,
        userId: user.id
      })
      throw new Error(`Failed to delete program: ${deleteError.message || 'Unknown error'}. Code: ${deleteError.code || 'N/A'}`)
    }

    console.log(`[DELETE PROGRAM] Successfully deleted program ${id}`)

    // Step 6: Revalidate the programs list page
    // Note: We don't revalidate /programs/${id} because the program is deleted
    // and trying to revalidate a deleted program's page causes errors
    revalidatePath('/programs')

    return { success: true, id }
  } catch (error: any) {
    // Log the full error for Vercel logs
    console.error('[DELETE PROGRAM] Fatal error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      programId: id,
      timestamp: new Date().toISOString()
    })

    // Re-throw with a user-friendly message, but the full error is in logs
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to delete program: ${error?.message || 'Unknown error occurred'}`)
  }
}

export async function getPrograms() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProgram(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

