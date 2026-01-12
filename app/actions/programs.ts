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

  const { data, error } = await supabase
    .from('programs')
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

  const { error } = await supabase
    .from('programs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/programs')
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

