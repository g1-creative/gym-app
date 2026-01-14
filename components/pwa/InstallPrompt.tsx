'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after 5 seconds
      setTimeout(() => setShowPrompt(true), 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-2xl border border-blue-400/20 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 bg-white/20 rounded-lg p-2">
            <img 
              src="/gymville-logo.png" 
              alt="Gymville" 
              className="h-8 w-8"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">
              Install Gymville
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              Get the full app experience with offline access and faster loading
            </p>
            
            <Button 
              onClick={handleInstall}
              className="w-full bg-white text-blue-600 hover:bg-blue-50"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
