import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessions } from '@/app/actions/sessions'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, Clock, TrendingUp, PlayCircle } from 'lucide-react'
import { formatVolume } from '@/lib/utils/weight'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const sessions = await getSessions(100)
  const completedSessions = sessions.filter((s: any) => s.completed_at)

  return (
    <PageLayout
      title="Workout History"
      subtitle={completedSessions.length > 0 ? `${completedSessions.length} ${completedSessions.length === 1 ? 'workout' : 'workouts'}` : undefined}
    >
      {completedSessions && completedSessions.length > 0 ? (
        <div className="space-y-1.5 sm:space-y-2">
          {completedSessions.map((session: any) => (
            <Link
              key={session.id}
              href={`/workout/${session.id}`}
              className="block"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-800 flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-xs sm:text-sm truncate mb-1">
                      {session.workout ? (session.workout as any).name : 'Freestyle Workout'}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[10px] sm:text-xs text-zinc-400">
                        {new Date(session.started_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
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
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 flex-shrink-0 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-6 sm:p-8">
            <p className="text-base sm:text-lg text-zinc-300 mb-3 sm:mb-4">No workouts yet</p>
            <Link href="/workout/new">
              <Button className="text-sm sm:text-base">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start your first workout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

