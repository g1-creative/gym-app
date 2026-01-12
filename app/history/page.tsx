import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessions } from '@/app/actions/sessions'
import Link from 'next/link'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const sessions = await getSessions(100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Workout History</h1>
          <Link
            href="/"
            className="text-primary-400 hover:text-primary-300"
          >
            ← Back
          </Link>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/workout/${session.id}`}
                className="block bg-slate-800 hover:bg-slate-700 rounded-lg p-4 transition-colors border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {session.workout ? (session.workout as any).name : 'Freestyle Workout'}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {new Date(session.started_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' • '}
                      {new Date(session.started_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {session.duration_seconds &&
                        ` • ${Math.floor(session.duration_seconds / 60)} min`}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.total_volume && (
                      <div className="text-lg font-semibold text-primary-400">
                        {session.total_volume.toFixed(0)} kg
                      </div>
                    )}
                    <div className="text-slate-400">→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-xl mb-4">No workouts yet</p>
            <Link
              href="/workout/new"
              className="text-primary-400 hover:text-primary-300"
            >
              Start your first workout →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

