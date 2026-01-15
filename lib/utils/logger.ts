/**
 * Production-safe logging utility
 * - In development: logs to console
 * - In production: can be configured to send to error tracking service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString()
      const contextStr = context ? ` ${JSON.stringify(context)}` : ''
      
      switch (level) {
        case 'debug':
          console.log(`[${timestamp}] DEBUG: ${message}${contextStr}`)
          break
        case 'info':
          console.log(`[${timestamp}] INFO: ${message}${contextStr}`)
          break
        case 'warn':
          console.warn(`[${timestamp}] WARN: ${message}${contextStr}`)
          break
        case 'error':
          console.error(`[${timestamp}] ERROR: ${message}${contextStr}`)
          break
      }
    } else if (level === 'error') {
      // In production, only log errors to console
      // In a real app, you'd send these to an error tracking service
      console.error(message, context)
      
      // TODO: Send to error tracking service (e.g., Sentry)
      // Example:
      // Sentry.captureMessage(message, {
      //   level: 'error',
      //   extra: context,
      // })
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  // Helper for tracking errors with additional context
  trackError(error: Error | unknown, context?: LogContext) {
    if (error instanceof Error) {
      this.error(error.message, {
        ...context,
        stack: error.stack,
        name: error.name,
      })
    } else {
      this.error('Unknown error occurred', {
        ...context,
        error: String(error),
      })
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)
export const trackError = logger.trackError.bind(logger)
