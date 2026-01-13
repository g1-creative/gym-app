'use client'

import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react'

interface RestTimerProps {
  duration: number // in seconds
  onComplete?: () => void
  onTimeUpdate?: (secondsElapsed: number) => void
  autoStart?: boolean
}

export interface RestTimerRef {
  start: () => void
  pause: () => void
  reset: () => void
}

export const RestTimer = forwardRef<RestTimerRef, RestTimerProps>(({ duration, onComplete, onTimeUpdate, autoStart = false }, ref) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useImperativeHandle(ref, () => ({
    start: () => {
      setIsRunning(true)
      setIsComplete(false)
    },
    pause: () => {
      setIsRunning(false)
    },
    reset: () => {
      setTimeLeft(duration)
      setIsRunning(false)
      setIsComplete(false)
      setSecondsElapsed(0)
      if (onTimeUpdate) onTimeUpdate(0)
    },
  }))

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev <= 1 ? 0 : prev - 1
          const newElapsed = duration - newTimeLeft
          setSecondsElapsed(newElapsed)
          if (onTimeUpdate) {
            onTimeUpdate(newElapsed)
          }
          
          if (prev <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            if (onComplete) onComplete()
            // Vibrate if supported (only on client)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200])
            }
          }
          return newTimeLeft
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, onComplete, onTimeUpdate, duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsComplete(false)
    setSecondsElapsed(0)
    if (onTimeUpdate) onTimeUpdate(0)
  }

  const start = () => {
    setIsRunning(true)
    setIsComplete(false)
  }

  const pause = () => {
    setIsRunning(false)
  }

  if (isComplete) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5 text-center">
        <div className="text-xl sm:text-2xl font-bold mb-3 text-white">Rest Complete! 🎉</div>
        <button
          onClick={reset}
          className="bg-black hover:bg-zinc-900 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base font-medium"
        >
          Reset Timer
        </button>
      </div>
    )
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm text-zinc-400 font-medium">Rest Timer</div>
        <div className="flex gap-2">
          {!isRunning && timeLeft < duration && (
            <button
              onClick={start}
              className="text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
            >
              Resume
            </button>
          )}
          {isRunning && (
            <button
              onClick={pause}
              className="text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="text-zinc-500 hover:text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="text-center mb-3 sm:mb-4">
        <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</div>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-2 sm:h-2.5 mb-3 sm:mb-4">
        <div
          className="bg-white h-2 sm:h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isRunning && timeLeft === duration && (
        <button
          onClick={start}
          className="w-full bg-black hover:bg-zinc-900 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base"
        >
          Start Rest
        </button>
      )}
    </div>
  )
})

RestTimer.displayName = 'RestTimer'


