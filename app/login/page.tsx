import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Component } from '@/components/ui/sign-in-card-2'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return <Component />
}

