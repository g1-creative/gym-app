import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Component } from '@/components/ui/sign-in-card-2'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[LOGIN PAGE] Rendering, hasUser:', !!user)

  if (user) {
    console.log('[LOGIN PAGE] User authenticated, redirecting to /')
    redirect('/')
  }

  return <Component />
}

