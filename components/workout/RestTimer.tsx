'use client'

import { useEffect, useState, useRef } from 'react'

interface RestTimerProps {
  duration: number // in seconds
  onComplete?: () => void
  onTimeUpdate?: (secondsElapsed: number) => void
  autoStart?: boolean
}

export function RestTimer({ duration, onComplete, onTimeUpdate, autoStart = false }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
            // Vibrate if supported
            if ('vibrate' in navigator) {
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
      <div className="bg-green-600 text-white rounded-lg p-4 text-center">
        <div className="text-2xl font-bold mb-2">Rest Complete!</div>
        <button
          onClick={reset}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
        >
          Reset Timer
        </button>
      </div>
    )
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-400">Rest Timer</div>
        <div className="flex gap-2">
          {!isRunning && timeLeft < duration && (
            <button
              onClick={start}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Resume
            </button>
          )}
          {isRunning && (
            <button
              onClick={pause}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="text-slate-400 hover:text-slate-300 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="text-center mb-3">
        <div className="text-4xl font-bold text-white">{formatTime(timeLeft)}</div>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isRunning && timeLeft === duration && (
        <button
          onClick={start}
          className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Start Rest
        </button>
      )}
    </div>
  )
}


