import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[API] signIn POST request received')
    const { email, password } = await request.json()
    
    console.log('[API] Creating Supabase client')
    const supabase = await createClient()
    
    console.log('[API] Calling signInWithPassword for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('[API] signIn result:', { 
      hasSession: !!data.session, 
      hasUser: !!data.user,
      error: error?.message 
    })
    
    if (error) {
      console.log('[API] signIn error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (data.session) {
      console.log('[API] signIn success')
      return NextResponse.json({ success: true })
    }
    
    console.log('[API] signIn failed - no session created')
    return NextResponse.json({ error: 'Failed to create session' }, { status: 400 })
  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

