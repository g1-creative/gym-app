import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  try {
    console.log('[API] signIn POST request received')
    const { email, password } = await request.json()
    
    const cookieStore = await cookies()
    const response = NextResponse.json({ success: false })
    
    console.log('[API] Creating Supabase client with cookie handling')
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
                response.cookies.set(name, value, options)
              })
            } catch (error) {
              console.error('[API] Error setting cookies:', error)
            }
          },
        },
      }
    )
    
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
      console.log('[API] signIn success, returning with cookies')
      return NextResponse.json({ success: true }, {
        status: 200,
        headers: response.headers,
      })
    }
    
    console.log('[API] signIn failed - no session created')
    return NextResponse.json({ error: 'Failed to create session' }, { status: 400 })
  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

