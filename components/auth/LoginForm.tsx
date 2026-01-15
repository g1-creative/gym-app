'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { logInfo, logError } from '@/lib/utils/logger'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    logInfo('Login form submitted', { isSignUp })
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        logInfo('Processing signup')
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email to confirm your account!')
        setIsLoading(false)
      } else {
        logInfo('Processing login via server action')
        // Use server action which handles cookies properly
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        
        const result = await login(formData)
        
        if (result?.error) {
          throw new Error(result.error)
        }
        
        // Server action will redirect automatically
        logInfo('Login server action completed')
      }
    } catch (err: any) {
      logError('Login failed', { error: err.message, isSignUp })
      setError(err.message || 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
      </button>

      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-center text-slate-400 hover:text-slate-300 text-sm"
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </form>
  )
}
