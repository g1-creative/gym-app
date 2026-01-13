import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/app/actions/sessions'
import { PageLayout } from '@/components/layout/PageLayout'
import { formatWeight, formatVolume } from '@/lib/utils/weight'
import { Calendar, Clock, TrendingUp, Dumbbell, ArrowLeft, Repeat } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function WorkoutSessionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let session
  try {
    session = await getSession(params.id)
  } catch (error) {
    redirect('/history')
  }

  if (!session) {
    redirect('/history')
  }

  // Group sets by exercise
  const groupedSets: Record<string, any[]> = {}
  if (session.sets && Array.isArray(session.sets)) {
    session.sets.forEach((set: any) => {
      const exerciseId = set.exercise?.id || 'unknown'
      if (!groupedSets[exerciseId]) {
        groupedSets[exerciseId] = []
      }
      groupedSets[exerciseId].push(set)
    })
  }

  // Calculate duration
  const duration = session.completed_at && session.started_at
    ? Math.floor((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000)
    : null

  return (
    <PageLayout
      title={session.workout ? (session.workout as any).name : 'Workout Session'}
      subtitle={session.completed_at 
        ? `Completed ${new Date(session.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}`
        : 'In Progress'}
      headerAction={
        <Link href="/history">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Session Info */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 flex-wrap">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {new Date(session.started_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              {new Date(session.started_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            {(session as any).workout_day_number && (
              <>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1">
                  <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">
                    Cycle {(session as any).workout_day_number}
                  </span>
                </div>
              </>
            )}
          </div>

          {duration && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Duration: {Math.floor(duration / 60)} min {duration % 60} sec</span>
            </div>
          )}

          {session.total_volume && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <div>
                <div className="text-xs sm:text-sm text-zinc-400">Total Volume</div>
                <div className="text-lg sm:text-xl font-bold text-white">{formatVolume(session.total_volume)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Session Notes */}
        {session.notes && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-2">Session Notes</div>
            <p className="text-xs sm:text-sm text-zinc-400 whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}

        {/* Exercises and Sets */}
        {Object.keys(groupedSets).length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedSets).map(([exerciseId, sets]) => {
              const exercise = sets[0]?.exercise
              if (!exercise) return null

              return (
                <div key={exerciseId} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-white">{exercise.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2 sm:p-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm">
                          <span className="text-zinc-400 font-medium">Set {set.set_number}</span>
                          {set.weight && (
                            <span className="text-white font-semibold">{formatWeight(set.weight)}</span>
                          )}
                          {set.reps && (
                            <span className="text-white">{set.reps} reps</span>
                          )}
                          {set.rpe && (
                            <span className="text-zinc-400">RPE {set.rpe}</span>
                          )}
                          {set.rest_seconds && (
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(set.rest_seconds / 60)}:{String(set.rest_seconds % 60).padStart(2, '0')}
                            </span>
                          )}
                          {set.volume && (
                            <span className="text-white font-semibold bg-zinc-800 px-2 py-0.5 rounded text-xs">
                              {formatVolume(set.volume)}
                            </span>
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
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-zinc-400">No sets logged for this workout</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

