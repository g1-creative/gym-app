'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Database } from '@/types/database'

type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscle_groups: z.array(z.string()).optional().nullable(),
  equipment: z.string().max(50).optional().nullable(),
  is_custom: z.boolean().optional(),
})

export async function createExercise(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rawData = {
    name: formData.get('name') as string,
    muscle_groups: formData.get('muscle_groups') ? JSON.parse(formData.get('muscle_groups') as string) : null,
    equipment: formData.get('equipment') as string | null,
    is_custom: formData.get('is_custom') === 'true',
  }

  const validated = exerciseSchema.parse(rawData)

  // Explicitly type the insert data to match Database schema
  const insertData = {
    user_id: user.id,
    name: validated.name,
    muscle_groups: validated.muscle_groups ?? null,
    equipment: validated.equipment ?? null,
    is_custom: validated.is_custom ?? false,
  }

  // Type assertion needed due to Supabase TypeScript inference limitations with SSR
  // Using double assertion to work around TypeScript's strict type checking
  const { data, error } = await supabase
    .from('exercises')
    .insert(insertData as unknown as ExerciseInsert)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/exercises')
  return data
}

export async function getExercises() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .or(`user_id.eq.${user.id},is_custom.eq.false`)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function searchExercises(query: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .or(`user_id.eq.${user.id},is_custom.eq.false`)
    .ilike('name', `%${query}%`)
    .is('deleted_at', null)
    .limit(20)

  if (error) throw error
  return data
}

