'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  console.log('[SERVER] signIn called with email:', email)
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  console.log('[SERVER] signIn result:', { 
    hasSession: !!data.session, 
    hasUser: !!data.user,
    error: error?.message 
  })
  
  if (error) {
    console.log('[SERVER] signIn error:', error.message)
    return { error: error.message }
  }
  
  if (data.session) {
    console.log('[SERVER] signIn success, redirecting to /')
    // Revalidate to ensure fresh data
    revalidatePath('/', 'layout')
    redirect('/')
  }
  
  console.log('[SERVER] signIn failed - no session created')
  return { error: 'Failed to create session' }
}

export async function signUp(email: string, password: string) {
  console.log('[SERVER] signUp called with email:', email)
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  console.log('[SERVER] signUp result:', { 
    hasSession: !!data.session, 
    hasUser: !!data.user,
    error: error?.message 
  })
  
  if (error) {
    console.log('[SERVER] signUp error:', error.message)
    return { error: error.message }
  }
  
  // If email confirmation is disabled, user is automatically signed in
  if (data.user && data.session) {
    console.log('[SERVER] signUp success with session, redirecting to /')
    revalidatePath('/', 'layout')
    redirect('/')
  }
  
  // Email confirmation is required
  console.log('[SERVER] signUp requires email confirmation')
  return { success: true, requiresConfirmation: true, message: 'Please check your email to confirm your account.' }
}

