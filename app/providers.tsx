'use client'

import { useEffect } from 'react'
import { logInfo, logError } from '@/lib/utils/logger'
import { analytics } from '@/lib/analytics'
import { errorTracking } from '@/lib/error-tracking'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics and error tracking
    analytics.init()
    errorTracking.init()

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logInfo('Service Worker registered', { scope: registration.scope })
        })
        .catch((error) => {
          logError('Service Worker registration failed', { error: String(error) })
        })
    }
  }, [])

  return <>{children}</>
}


