'use client'

import { useState, useTransition, useEffect } from 'react'
import { WorkoutSessionWithSets } from '@/types'
import { SetInput } from './SetInput'
import { RestTimer } from './RestTimer'
import { ExerciseSelector } from './ExerciseSelector'
import { ProgressiveOverloadCard } from '@/components/analytics/ProgressiveOverloadCard'
import { logSet, updateSet } from '@/app/actions/sets'
import { completeSession, updateSession } from '@/app/actions/sessions'
import { getProgressiveOverloadComparison } from '@/app/actions/analytics'
import { useRouter } from 'next/navigation'
import { SetWithExercise, ProgressiveOverloadComparison } from '@/types'
import { Pencil, Save, X } from 'lucide-react'
import { initOfflineDB, savePendingOperation } from '@/lib/utils/offline'

interface ActiveWorkoutClientProps {
  session: WorkoutSessionWithSets
}

export function ActiveWorkoutClient({ session: initialSession }: ActiveWorkoutClientProps) {
  const [session, setSession] = useState(initialSession)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [restTimerDuration, setRestTimerDuration] = useState(90)
  const [restSecondsElapsed, setRestSecondsElapsed] = useState(0)
  const [lastLoggedSetId, setLastLoggedSetId] = useState<string | null>(null)
  const [progressiveOverload, setProgressiveOverload] = useState<ProgressiveOverloadComparison | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [sessionNotes, setSessionNotes] = useState(session.notes || '')
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Check online status - only on client
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const exercises = Array.from(
    new Map(
      session.sets.map((set) => [set.exercise_id, (set as SetWithExercise).exercise])
    ).entries()
  )

  const handleLogSet = async (setData: any) => {
    if (!selectedExercise) {
      alert('Please select an exercise first')
      return
    }

    const setDataWithRest = {
      ...setData,
      rest_seconds: restSecondsElapsed > 0 ? restSecondsElapsed : null,
    }

    // If offline, save to IndexedDB
    if (mounted && !isOnline && typeof window !== 'undefined') {
      try {
        await initOfflineDB()
        await savePendingOperation({
          type: 'set',
          data: {
            ...setDataWithRest,
            sessionId: session.id,
            exerciseId: selectedExercise,
          },
        })
        alert('Set saved offline. Will sync when online.')
        // Still update UI optimistically
        const tempSet = {
          id: `temp-${Date.now()}`,
          ...setDataWithRest,
          exercise_id: selectedExercise,
          session_id: session.id,
          set_number: (groupedSets[selectedExercise]?.length || 0) + 1,
          exercise: exercises.find(([id]) => id === selectedExercise)?.[1],
        } as SetWithExercise
        
        setSession((prev) => ({
          ...prev,
          sets: [...prev.sets, tempSet],
        }))
        setRestSecondsElapsed(0)
        return
      } catch (error) {
        console.error('Error saving offline:', error)
        alert('Failed to save offline. Please try again when online.')
        return
      }
    }

    startTransition(async () => {
      try {
        const newSet = await logSet({
          ...setDataWithRest,
          sessionId: session.id,
          exerciseId: selectedExercise,
        }) as SetWithExercise

        // Update local state optimistically
        setSession((prev) => ({
          ...prev,
          sets: [...prev.sets, newSet],
        }))

        setLastLoggedSetId(newSet.id)
        setRestSecondsElapsed(0)

        // Fetch progressive overload comparison
        if (newSet.weight && newSet.reps) {
          const volume = newSet.weight * newSet.reps
          try {
            const comparison = await getProgressiveOverloadComparison(selectedExercise, {
              weight: newSet.weight,
              reps: newSet.reps,
              rpe: newSet.rpe || null,
              volume,
            })
            setProgressiveOverload(comparison)
          } catch (error) {
            console.error('Error fetching progressive overload:', error)
          }
        }

        // Start rest timer
        const workoutExercise = session.workout
          ? (session.workout as any).rest_timer_seconds
          : null
        setRestTimerDuration(workoutExercise || 90)
      } catch (error) {
        console.error('Error logging set:', error)
        alert('Failed to log set. Please try again.')
      }
    })
  }

  const handleSaveSessionNotes = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('notes', sessionNotes)
        await updateSession(session.id, formData)
        setIsEditingNotes(false)
        setSession((prev) => ({ ...prev, notes: sessionNotes }))
      } catch (error) {
        console.error('Error saving notes:', error)
        alert('Failed to save notes')
      }
    })
  }

  const handleCompleteWorkout = async () => {
    if (confirm('Complete this workout?')) {
      startTransition(async () => {
        try {
          await completeSession(session.id)
          router.push('/')
          router.refresh()
        } catch (error) {
          console.error('Error completing workout:', error)
          alert('Failed to complete workout. Please try again.')
        }
      })
    }
  }

  const groupedSets = session.sets.reduce((acc, set) => {
    const exerciseId = set.exercise_id
    if (!acc[exerciseId]) {
      acc[exerciseId] = []
    }
    acc[exerciseId].push(set)
    return acc
  }, {} as Record<string, typeof session.sets>)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-x-hidden">
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-lg pb-24 sm:pb-28">
        {/* Offline indicator */}
        {mounted && !isOnline && (
          <div className="mb-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 text-sm text-orange-300">
            ⚠️ You're offline. Changes will sync when you're back online.
          </div>
        )}

        <header className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {session.workout ? (session.workout as any).name : 'Active Workout'}
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Started {new Date(session.started_at).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleCompleteWorkout}
              disabled={isPending}
              className="bg-black hover:bg-zinc-900 disabled:opacity-50 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base text-white"
            >
              Complete
            </button>
          </div>

          {/* Session Notes */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-zinc-300">Session Notes</label>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-zinc-400 hover:text-zinc-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSessionNotes}
                    disabled={isPending}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false)
                      setSessionNotes(session.notes || '')
                    }}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {isEditingNotes ? (
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add notes about your workout..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            ) : (
              <p className="text-xs sm:text-sm text-zinc-400">
                {session.notes || 'No notes yet. Click edit to add notes.'}
              </p>
            )}
          </div>

          {session.total_volume && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-zinc-400 mb-1">Total Volume</div>
              <div className="text-xl sm:text-2xl font-bold">{session.total_volume.toFixed(0)} kg</div>
            </div>
          )}
        </header>

        <div className="space-y-4 sm:space-y-6">
          {/* Progressive Overload Card */}
          {progressiveOverload && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <ProgressiveOverloadCard comparison={progressiveOverload} />
            </div>
          )}

          {/* Rest Timer */}
          <RestTimer
            duration={restTimerDuration}
            autoStart={false}
            onTimeUpdate={(seconds) => setRestSecondsElapsed(seconds)}
          />

          {/* Exercise Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
              Select Exercise
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {exercises.map(([exerciseId, exercise]) => (
                <button
                  key={exerciseId}
                  onClick={() => {
                    setSelectedExercise(exerciseId)
                    setProgressiveOverload(null)
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                    selectedExercise === exerciseId
                      ? 'bg-black border-zinc-700 text-white'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {exercise.name}
                </button>
              ))}
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="px-3 sm:px-4 py-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 text-xs sm:text-sm"
              >
                + Add Exercise
              </button>
            </div>
          </div>

          {/* Set Input */}
          {selectedExercise && (
            <SetInput
              onLog={handleLogSet}
              isLoading={isPending}
              defaultWeight={
                groupedSets[selectedExercise]?.[groupedSets[selectedExercise].length - 1]?.weight ||
                null
              }
              defaultReps={
                groupedSets[selectedExercise]?.[groupedSets[selectedExercise].length - 1]?.reps ||
                null
              }
            />
          )}

          {/* Logged Sets */}
          {Object.entries(groupedSets).map(([exerciseId, sets]) => {
            const exercise = (sets[0] as SetWithExercise).exercise
            return (
              <div key={exerciseId} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3">{exercise.name}</h3>
                <div className="space-y-2">
                  {sets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm">
                        <span className="text-zinc-400">Set {set.set_number}</span>
                        {set.weight && <span>{set.weight} kg</span>}
                        {set.reps && <span>{set.reps} reps</span>}
                        {set.rpe && <span className="text-zinc-400">RPE {set.rpe}</span>}
                        {set.rest_seconds && (
                          <span className="text-zinc-500">Rest: {Math.floor(set.rest_seconds / 60)}:{String(set.rest_seconds % 60).padStart(2, '0')}</span>
                        )}
                        {set.volume && (
                          <span className="text-primary-400 font-medium">{set.volume.toFixed(0)} kg</span>
                        )}
                      </div>
                      {set.notes && (
                        <div className="text-xs text-zinc-400">💬 {set.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelect={(exerciseId) => {
          setSelectedExercise(exerciseId)
          setShowExerciseSelector(false)
        }}
      />
    </div>
  )
}
