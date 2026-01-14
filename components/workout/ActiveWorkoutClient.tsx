'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { WorkoutSessionWithSets } from '@/types'
import { SetInput } from './SetInput'
import { RestTimer, RestTimerRef } from './RestTimer'
import { ExerciseSelector } from './ExerciseSelector'
import { ProgressiveOverloadCard } from '@/components/analytics/ProgressiveOverloadCard'
import { SmartPlatesCalculator } from './SmartPlatesCalculator'
import { logSet, updateSet } from '@/app/actions/sets'
import { completeSession, updateSession } from '@/app/actions/sessions'
import { getProgressiveOverloadComparison } from '@/app/actions/analytics'
import { useRouter } from 'next/navigation'
import { SetWithExercise, ProgressiveOverloadComparison } from '@/types'
import { Pencil, Save, X, Dumbbell, Clock, Copy, Calculator, TrendingUp, Plus } from 'lucide-react'
import { initOfflineDB, savePendingOperation } from '@/lib/utils/offline'
import { formatWeight, formatVolume, kgToLbs } from '@/lib/utils/weight'

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
  const [showPlatesCalculator, setShowPlatesCalculator] = useState(false)
  const restTimerRef = useRef<RestTimerRef>(null)
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

  // Combine exercises from logged sets and workout template
  const workoutWithExercises = session.workout as any
  const templateExercises = (workoutWithExercises?.workout_exercises || [])
    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    .map((we: any) => ({
      id: we.exercise_id,
      exercise: we.exercise,
      order: we.order_index || 0,
      notes: we.notes,
      rest_timer_seconds: we.rest_timer_seconds
    }))
  
  const exercises = Array.from(
    new Map([
      // Add template exercises
      ...templateExercises.map((te: any) => [te.id, te.exercise]),
      // Add any exercises from logged sets not in template
      ...session.sets
        .filter(set => !templateExercises.find((te: any) => te.id === set.exercise_id))
        .map((set) => [set.exercise_id, (set as SetWithExercise).exercise])
    ]).entries()
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

        // Auto-start rest timer
        const workoutExercise = session.workout
          ? (session.workout as any).rest_timer_seconds
          : null
        const restDuration = workoutExercise || 90
        setRestTimerDuration(restDuration)
        // Reset and auto-start the rest timer
        if (restTimerRef.current) {
          restTimerRef.current.reset()
          restTimerRef.current.start()
        }

        // Hide the form after logging the set
        setSelectedExercise(null)
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
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {session.workout ? (session.workout as any).name : 'Active Workout'}
                </h1>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
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
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-4 w-4 text-zinc-400" />
                <div className="text-xs sm:text-sm text-zinc-400">Total Volume</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{formatVolume(session.total_volume)}</div>
            </div>
          )}
        </header>

        <div className="space-y-4 sm:space-y-6">
          {/* Progressive Overload Card - More Prominent */}
          {progressiveOverload && (
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="text-sm sm:text-base font-semibold text-white">Progress vs Last Session</h3>
              </div>
              <ProgressiveOverloadCard comparison={progressiveOverload} />
            </div>
          )}

          {/* Rest Timer */}
          <RestTimer
            ref={restTimerRef}
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
              onOpenCalculator={() => {
                const lastSet = groupedSets[selectedExercise]?.[groupedSets[selectedExercise].length - 1]
                setShowPlatesCalculator(true)
              }}
            />
          )}

          {/* Logged Sets */}
          {Object.entries(groupedSets).map(([exerciseId, sets]) => {
            const exercise = (sets[0] as SetWithExercise).exercise
            return (
              <div key={exerciseId} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3">{exercise.name}</h3>
                <div className="space-y-2">
                  {sets.map((set, idx) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-2 sm:p-3 group"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm flex-1">
                        <span className="text-zinc-400 font-medium">Set {set.set_number}</span>
                        {set.weight && <span className="text-white font-semibold">{formatWeight(set.weight)}</span>}
                        {set.reps && <span className="text-white">{set.reps} reps</span>}
                        {set.rpe && <span className="text-zinc-400">RPE {set.rpe}</span>}
                        {set.rest_seconds && (
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(set.rest_seconds / 60)}:{String(set.rest_seconds % 60).padStart(2, '0')}
                          </span>
                        )}
                        {set.volume && (
                          <span className="text-white font-semibold bg-zinc-800 px-2 py-0.5 rounded">{formatVolume(set.volume)}</span>
                        )}
                        {set.notes && (
                          <span className="text-xs text-zinc-400">💬 {set.notes}</span>
                        )}
                      </div>
                      {idx === sets.length - 1 && (
                        <button
                          onClick={() => {
                            // Select this exercise and show form to log another set
                            setSelectedExercise(exerciseId)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white ml-2"
                          title="Add another set"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
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

      {/* Smart Plates Calculator */}
      <SmartPlatesCalculator
        isOpen={showPlatesCalculator}
        onClose={() => setShowPlatesCalculator(false)}
        targetWeight={
          selectedExercise && groupedSets[selectedExercise]?.[groupedSets[selectedExercise].length - 1]?.weight
            ? groupedSets[selectedExercise][groupedSets[selectedExercise].length - 1].weight
            : null
        }
        onWeightSelect={(weightKg) => {
          // This will be handled by updating the SetInput component
          // For now, we'll just close the calculator
          // The weight will need to be set via SetInput's internal state
        }}
      />
    </div>
  )
}
