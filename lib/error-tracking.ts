/**
 * Error tracking utility
 * Integrate with Sentry, LogRocket, or other error tracking services
 */

interface ErrorContext {
  [key: string]: any
}

class ErrorTracking {
  private isProduction = process.env.NODE_ENV === 'production'
  private isInitialized = false

  /**
   * Initialize error tracking
   * Call this once in your app root
   */
  init() {
    if (this.isInitialized) return

    if (this.isProduction) {
      // TODO: Initialize error tracking service
      // Example for Sentry:
      // import * as Sentry from '@sentry/nextjs'
      // 
      // Sentry.init({
      //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 0.1,
      //   beforeSend(event) {
      //     // Filter out sensitive data
      //     return event
      //   },
      // })
    }

    this.isInitialized = true
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | unknown, context?: ErrorContext) {
    if (!this.isProduction) {
      console.error('[Error Tracking]', error, context)
      return
    }

    // TODO: Send to error tracking service
    // Example for Sentry:
    // import * as Sentry from '@sentry/nextjs'
    // 
    // if (error instanceof Error) {
    //   Sentry.captureException(error, {
    //     extra: context,
    //   })
    // }
  }

  /**
   * Capture a message (for non-error logging)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (!this.isProduction) {
      console.log(`[Error Tracking] ${level.toUpperCase()}:`, message, context)
      return
    }

    // TODO: Send to error tracking service
    // Example for Sentry:
    // import * as Sentry from '@sentry/nextjs'
    // 
    // Sentry.captureMessage(message, {
    //   level: level as any,
    //   extra: context,
    // })
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, username?: string) {
    if (!this.isProduction) {
      console.log('[Error Tracking] Set user:', { userId, email, username })
      return
    }

    // TODO: Send to error tracking service
    // Example for Sentry:
    // import * as Sentry from '@sentry/nextjs'
    // 
    // Sentry.setUser({
    //   id: userId,
    //   email,
    //   username,
    // })
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (!this.isProduction) {
      console.log('[Error Tracking] Breadcrumb:', { message, category, data })
      return
    }

    // TODO: Send to error tracking service
    // Example for Sentry:
    // import * as Sentry from '@sentry/nextjs'
    // 
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   data,
    //   level: 'info',
    // })
  }
}

// Export singleton instance
export const errorTracking = new ErrorTracking()

// Convenience functions
export const captureException = errorTracking.captureException.bind(errorTracking)
export const captureMessage = errorTracking.captureMessage.bind(errorTracking)
export const setErrorUser = errorTracking.setUser.bind(errorTracking)
export const addBreadcrumb = errorTracking.addBreadcrumb.bind(errorTracking)
