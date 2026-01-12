'use client'

import { useState, useTransition } from 'react'
import { WorkoutSessionWithSets } from '@/types'
import { SetInput } from './SetInput'
import { RestTimer } from './RestTimer'
import { logSet } from '@/app/actions/sets'
import { completeSession } from '@/app/actions/sessions'
import { useRouter } from 'next/navigation'
import { SetWithExercise } from '@/types'

interface ActiveWorkoutClientProps {
  session: WorkoutSessionWithSets
}

export function ActiveWorkoutClient({ session: initialSession }: ActiveWorkoutClientProps) {
  const [session, setSession] = useState(initialSession)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [restTimerDuration, setRestTimerDuration] = useState(90)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

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

    startTransition(async () => {
      try {
        const newSet = await logSet({
          ...setData,
          sessionId: session.id,
          exerciseId: selectedExercise,
        })

        // Update local state optimistically
        setSession((prev) => ({
          ...prev,
          sets: [...prev.sets, newSet as SetWithExercise],
        }))

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                {session.workout ? (session.workout as any).name : 'Active Workout'}
              </h1>
              <p className="text-slate-400">
                Started {new Date(session.started_at).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleCompleteWorkout}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Complete
            </button>
          </div>

          {session.total_volume && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Total Volume</div>
              <div className="text-2xl font-bold">{session.total_volume.toFixed(0)} kg</div>
            </div>
          )}
        </header>

        <div className="space-y-6">
          {/* Rest Timer */}
          <RestTimer duration={restTimerDuration} autoStart={false} />

          {/* Exercise Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Exercise
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {exercises.map(([exerciseId, exercise]) => (
                <button
                  key={exerciseId}
                  onClick={() => setSelectedExercise(exerciseId)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedExercise === exerciseId
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {exercise.name}
                </button>
              ))}
              <button
                onClick={() => {
                  // TODO: Open exercise selector modal
                  alert('Exercise selector coming soon')
                }}
                className="px-4 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
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
              <div key={exerciseId} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3">{exercise.name}</h3>
                <div className="space-y-2">
                  {sets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Set {set.set_number}</span>
                        {set.weight && <span>{set.weight} kg</span>}
                        {set.reps && <span>{set.reps} reps</span>}
                        {set.rpe && <span className="text-slate-400">RPE {set.rpe}</span>}
                        {set.volume && (
                          <span className="text-primary-400">{set.volume.toFixed(0)} kg</span>
                        )}
                      </div>
                      {set.notes && (
                        <div className="text-sm text-slate-400">💬 {set.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

