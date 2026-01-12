import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('[SERVER COOKIES] getAll called, count:', allCookies.length)
          return allCookies
        },
        setAll(cookiesToSet: any) {
          try {
            console.log('[SERVER COOKIES] setAll called, setting', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }: any) => {
              console.log('[SERVER COOKIES] Setting cookie:', name, 'with options:', options)
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('[SERVER COOKIES] Error setting cookies:', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

