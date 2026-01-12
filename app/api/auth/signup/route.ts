import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[API] signUp POST request received')
    const { email, password } = await request.json()
    
    console.log('[API] Creating Supabase client')
    const supabase = await createClient()
    
    console.log('[API] Calling signUp for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    console.log('[API] signUp result:', { 
      hasSession: !!data.session, 
      hasUser: !!data.user,
      error: error?.message 
    })
    
    if (error) {
      console.log('[API] signUp error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // If email confirmation is disabled, user is automatically signed in
    if (data.user && data.session) {
      console.log('[API] signUp success with session')
      return NextResponse.json({ success: true })
    }
    
    // Email confirmation is required
    if (data.user && !data.session) {
      console.log('[API] signUp requires email confirmation')
      return NextResponse.json({ 
        success: true, 
        requiresConfirmation: true, 
        message: 'Please check your email to confirm your account.' 
      })
    }
    
    console.log('[API] signUp failed - no user created')
    return NextResponse.json({ error: 'Failed to create account' }, { status: 400 })
  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

