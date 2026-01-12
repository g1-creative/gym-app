'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // Revalidate to ensure fresh data
  revalidatePath('/', 'layout')
  redirect('/')
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
    redirect('/')
  }
  
  return { success: true, message: 'Please check your email to confirm your account.' }
}

