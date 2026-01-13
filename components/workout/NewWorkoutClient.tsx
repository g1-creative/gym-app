'use client'

import { useState, useTransition, useEffect } from 'react'
import { Program } from '@/types'
import { createSession, getSessionsForWorkout, getNextWorkoutDayNumber } from '@/app/actions/sessions'
import { getWorkoutsForProgram } from '@/app/actions/workouts'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { PlayCircle, Calendar, TrendingUp, Clock, ArrowRight, BarChart3, Repeat } from 'lucide-react'
import { formatVolume } from '@/lib/utils/weight'
import Link from 'next/link'

interface NewWorkoutClientProps {
  programs: Program[]
}

export function NewWorkoutClient({ programs }: NewWorkoutClientProps) {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [previousSessions, setPreviousSessions] = useState<any[]>([])
  const [nextDayNumber, setNextDayNumber] = useState<number | null>(null)
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Fetch workouts when program is selected
  useEffect(() => {
    if (selectedProgram) {
      setIsLoadingWorkouts(true)
      getWorkoutsForProgram(selectedProgram)
        .then((data) => {
          setWorkouts(data || [])
          setSelectedWorkout(null)
          setPreviousSessions([])
        })
        .catch((error) => {
          console.error('Error fetching workouts:', error)
          setWorkouts([])
        })
        .finally(() => {
          setIsLoadingWorkouts(false)
        })
    } else {
      setWorkouts([])
      setSelectedWorkout(null)
      setPreviousSessions([])
    }
  }, [selectedProgram])

  // Fetch previous sessions and day number when workout is selected
  useEffect(() => {
    if (selectedWorkout) {
      Promise.all([
        getSessionsForWorkout(selectedWorkout, 5),
        getNextWorkoutDayNumber(selectedWorkout)
      ])
        .then(([sessions, dayNumber]) => {
          setPreviousSessions(sessions || [])
          setNextDayNumber(dayNumber)
        })
        .catch((error) => {
          console.error('Error fetching workout data:', error)
          setPreviousSessions([])
          setNextDayNumber(1)
        })
    } else {
      setPreviousSessions([])
      setNextDayNumber(null)
    }
  }, [selectedWorkout])

  const handleStart = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        if (selectedProgram) formData.append('program_id', selectedProgram)
        if (selectedWorkout) {
          formData.append('workout_id', selectedWorkout)
          // Add workout day number for tracking cycles
          if (nextDayNumber !== null) {
            formData.append('workout_day_number', nextDayNumber.toString())
          }
        }

        const session = await createSession(formData)
        router.push('/workout/active')
        router.refresh()
      } catch (error) {
        console.error('Error starting workout:', error)
        alert('Failed to start workout. Please try again.')
      }
    })
  }

  const selectedWorkoutData = workouts.find((w) => w.id === selectedWorkout)

  return (
    <PageLayout
      title="Start New Workout"
      subtitle={programs.length > 0 ? `Choose from ${programs.length} ${programs.length === 1 ? 'program' : 'programs'}` : 'Start a freestyle workout'}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
              Select Program (Optional)
            </label>
            <select
              value={selectedProgram || ''}
              onChange={(e) => {
                setSelectedProgram(e.target.value || null)
              }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Freestyle Workout</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Leave empty to start a freestyle workout without a program
            </p>
          </div>

          {selectedProgram && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
                Select Workout
              </label>
              {isLoadingWorkouts ? (
                <div className="text-xs sm:text-sm text-zinc-400">Loading workouts...</div>
              ) : workouts.length === 0 ? (
                <div className="text-xs sm:text-sm text-zinc-400 mb-2">
                  No workouts in this program. <Link href={`/programs/${selectedProgram}`} className="text-blue-400 hover:underline">Create one</Link>
                </div>
              ) : (
                <>
                  <select
                    value={selectedWorkout || ''}
                    onChange={(e) => {
                      setSelectedWorkout(e.target.value || null)
                    }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a workout...</option>
                    {workouts.map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name}
                      </option>
                    ))}
                  </select>
                  {selectedWorkoutData && selectedWorkoutData.description && (
                    <p className="text-xs text-zinc-500 mt-1">{selectedWorkoutData.description}</p>
                  )}
                  {nextDayNumber !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <Repeat className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs font-semibold text-blue-400">
                            Cycle {nextDayNumber}
                          </span>
                        </div>
                      </div>
                      {previousSessions.length > 0 && (
                        <span className="text-xs text-zinc-500">
                          ({previousSessions.length} previous {previousSessions.length === 1 ? 'session' : 'sessions'})
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Previous Sessions Comparison */}
        {selectedWorkout && previousSessions.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300">Previous Sessions</h3>
              </div>
              {nextDayNumber !== null && (
                <div className="text-xs text-zinc-500">
                  Starting Cycle {nextDayNumber}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {previousSessions.slice(0, 3).map((session: any) => (
                <Link
                  key={session.id}
                  href={`/workout/${session.id}`}
                  className="block bg-zinc-800/50 rounded-lg p-2 sm:p-3 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-zinc-300">
                        {new Date(session.started_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {session.workout_day_number && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <div className="flex items-center gap-1">
                            <Repeat className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-blue-400 font-medium">
                              Cycle {session.workout_day_number}
                            </span>
                          </div>
                        </>
                      )}
                      {session.duration_seconds && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            <span className="text-[10px] sm:text-xs text-zinc-400">
                              {Math.floor(session.duration_seconds / 60)} min
                            </span>
                          </div>
                        </>
                      )}
                      {session.total_volume && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-[10px] sm:text-xs text-green-400 font-medium">
                              {formatVolume(session.total_volume)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-2">
              Compare your progress with previous sessions
            </p>
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={isPending || (selectedProgram ? !selectedWorkout : false)}
          className="w-full text-xs sm:text-sm"
          size="lg"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isPending ? 'Starting...' : 'Start Workout'}
        </Button>
      </div>
    </PageLayout>
  )
}
