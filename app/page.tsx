import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getActiveSession, getSessions } from './actions/sessions'
import { getPrograms } from './actions/programs'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  
  // Route protection: Check auth in page, not middleware
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [activeSession, recentSessions, programs] = await Promise.all([
    getActiveSession(),
    getSessions(5),
    getPrograms(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gym Tracker</h1>
          <p className="text-slate-400">Track your progress, achieve your goals</p>
        </header>

        {activeSession && (
          <div className="mb-6">
            <Link
              href="/workout/active"
              className="block bg-primary-600 hover:bg-primary-700 rounded-lg p-6 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Active Workout</h2>
                  <p className="text-primary-200">
                    Started {new Date(activeSession.started_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/workout/new"
            className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-2">Start New Workout</h3>
            <p className="text-slate-400">Begin logging your session</p>
          </Link>

          <Link
            href="/programs"
            className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-2">Programs</h3>
            <p className="text-slate-400">
              {programs.length} {programs.length === 1 ? 'program' : 'programs'}
            </p>
          </Link>
        </div>

        {recentSessions && recentSessions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Recent Workouts</h2>
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <Link
                  key={session.id}
                  href={`/workout/${session.id}`}
                  className="block bg-slate-800 hover:bg-slate-700 rounded-lg p-4 transition-colors border border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {session.workout ? (session.workout as any).name : 'Freestyle Workout'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {new Date(session.started_at).toLocaleDateString()} •{' '}
                        {session.total_volume ? `${session.total_volume.toFixed(0)} kg` : 'No volume'}
                      </p>
                    </div>
                    <div className="text-slate-400">→</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/history"
              className="block text-center mt-4 text-primary-400 hover:text-primary-300"
            >
              View All History →
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

