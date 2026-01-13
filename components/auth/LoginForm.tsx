'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[LOGIN] Form submitted')
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (isSignUp) {
        console.log('[LOGIN] Signing up...')
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email to confirm your account!')
        setIsLoading(false)
      } else {
        console.log('[LOGIN] Signing in...')
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.log('[LOGIN] Error:', error)
          throw error
        }
        
        console.log('[LOGIN] Success! Checking session...')
        
        // Verify session is established
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[LOGIN] Session exists:', !!session)
        console.log('[LOGIN] Session token:', session?.access_token?.substring(0, 20) + '...')
        console.log('[LOGIN] Current cookies:', document.cookie.split(';').map(c => c.trim().split('=')[0]))
        
        // Wait longer for cookies to be fully written by browser
        console.log('[LOGIN] Waiting 2 seconds for cookie propagation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log('[LOGIN] Final cookies check:', document.cookie.split(';').map(c => c.trim().split('=')[0]))
        console.log('[LOGIN] Redirecting to dashboard...')
        
        // Use hard redirect for reliability
        window.location.href = '/'
      }
    } catch (err: any) {
      console.error('[LOGIN] Exception:', err)
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
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
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
