'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    } else {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            
            <p className="text-slate-400 text-sm mb-4">
              We encountered an error while rendering this component.
            </p>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mb-4 p-3 bg-slate-800 rounded-lg text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
              size="sm"
            >
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
