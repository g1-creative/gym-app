'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  try {
    console.log('[SERVER] signIn called with email:', email)
    const supabase = await createClient()
    console.log('[SERVER] Supabase client created')
    
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
      console.log('[SERVER] signIn success, revalidating and redirecting')
      try {
        revalidatePath('/', 'layout')
        console.log('[SERVER] Revalidation complete')
      } catch (revalidateError) {
        console.error('[SERVER] Revalidation error:', revalidateError)
      }
      redirect('/')
    }
    
    console.log('[SERVER] signIn failed - no session created')
    return { error: 'Failed to create session' }
  } catch (error: any) {
    // redirect() throws an error which is expected - re-throw it
    if (error.message?.includes('NEXT_REDIRECT')) {
      console.log('[SERVER] Redirect thrown (expected)')
      throw error
    }
    console.error('[SERVER] Unexpected error in signIn:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
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

