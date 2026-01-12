'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  if (data.session) {
    // Revalidate to ensure fresh data
    revalidatePath('/', 'layout')
    return { success: true }
  }
  
  return { error: 'Failed to create session' }
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // If email confirmation is disabled, user is automatically signed in
  if (data.user && data.session) {
    revalidatePath('/', 'layout')
    return { success: true }
  }
  
  // Email confirmation is required
  return { success: true, requiresConfirmation: true, message: 'Please check your email to confirm your account.' }
}

