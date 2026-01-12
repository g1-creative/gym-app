import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPrograms } from '@/app/actions/programs'
import Link from 'next/link'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const programs = await getPrograms()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Programs</h1>
          <Link
            href="/programs/new"
            className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + New Program
          </Link>
        </div>

        {programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((program: any) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="block bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors border border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{program.name}</h3>
                  {program.is_active && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                {program.description && (
                  <p className="text-slate-400 text-sm">{program.description}</p>
                )}
                <div className="mt-4 text-slate-500 text-sm">
                  Created {new Date(program.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-xl mb-4">No programs yet</p>
            <Link
              href="/programs/new"
              className="text-primary-400 hover:text-primary-300"
            >
              Create your first program →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

