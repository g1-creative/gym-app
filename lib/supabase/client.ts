import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { getEnv } from '@/lib/utils/env'

export function createClient() {
  return createBrowserClient<Database>(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}


