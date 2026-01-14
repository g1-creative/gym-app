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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First, verify the program exists and belongs to the user
  const verifyQuery = supabase.from('programs') as any
  const { data: existingProgram, error: verifyError } = await verifyQuery
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (verifyError || !existingProgram) {
    throw new Error('Program not found or you do not have permission to delete it')
  }

  // Soft delete all associated workouts first
  const workoutsQuery = supabase.from('workouts') as any
  const { error: workoutsError } = await workoutsQuery
    .update({ deleted_at: new Date().toISOString() })
    .eq('program_id', id)
    .is('deleted_at', null)

  if (workoutsError) {
    console.error('Error deleting associated workouts:', workoutsError)
    // Continue with program deletion even if workout deletion fails
  }

  // Soft delete the program
  const query = supabase.from('programs') as any
  const { data, error } = await query
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error deleting program:', error)
    throw new Error(`Failed to delete program: ${error.message || 'Unknown error'}`)
  }

  if (!data) {
    throw new Error('Program deletion failed: No data returned')
  }

  revalidatePath('/programs')
  return { success: true, id }
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

