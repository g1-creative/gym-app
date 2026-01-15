'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell } from 'lucide-react'

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if loading screen has already been shown in this session
    const shown = sessionStorage.getItem('loadingScreenShown')
    
    if (shown === 'true') {
      setIsLoading(false)
      setHasShown(true)
      return
    }

    // Show loading screen for 2 seconds on first load
    const timer = setTimeout(() => {
      setIsLoading(false)
      sessionStorage.setItem('loadingScreenShown', 'true')
      setHasShown(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Don't render anything after it's been shown once
  if (hasShown && !isLoading) {
    return null
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse" />
          
          {/* Logo and brand */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full" />
              <img 
                src="/gymville-logo.png" 
                alt="Gymville" 
                className="h-24 w-24 relative z-10"
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center space-y-2"
            >
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Gymville
              </h1>
              <p className="text-zinc-400 text-sm">
                Progressive Overload Tracker
              </p>
            </motion.div>

            {/* Animated loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 mt-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            </motion.div>
          </div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-xs text-zinc-500">
              Track • Train • Transform
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
