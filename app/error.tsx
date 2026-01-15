'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error('Application error:', error)
    } else {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
        
        <p className="text-slate-400 mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>
        
        {process.env.NODE_ENV !== 'production' && error.message && (
          <div className="mb-6 p-4 bg-slate-800 rounded-lg text-left">
            <p className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-slate-600 hover:bg-slate-800"
          >
            Go home
          </Button>
        </div>
        
        {error.digest && (
          <p className="mt-6 text-xs text-slate-500">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
