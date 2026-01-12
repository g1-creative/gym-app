import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Gym Tracker</h1>
          <p className="text-slate-400 mb-6">Sign in to track your workouts</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

