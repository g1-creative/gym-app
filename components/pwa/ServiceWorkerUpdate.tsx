'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'

export function ServiceWorkerUpdate() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      // Check for updates periodically (every 5 minutes)
      const interval = setInterval(() => {
        reg.update()
      }, 5 * 60 * 1000)

      return () => clearInterval(interval)
    })

    // Listen for messages from service worker
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        setShowUpdate(true)
      }
    }

    navigator.serviceWorker.addEventListener('message', messageHandler)

    // Check for waiting service worker
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setShowUpdate(true)
      }
    })

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler)
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page to load the new version
      window.location.reload()
    } else {
      // Just reload if no waiting worker
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down max-w-md w-full px-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-2xl border border-blue-400/20 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 bg-white/20 rounded-lg p-2">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">
              Update Available
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              A new version of Gymville is available. Refresh to get the latest features.
            </p>
            
            <Button 
              onClick={handleUpdate}
              className="w-full bg-white text-blue-600 hover:bg-blue-50"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
