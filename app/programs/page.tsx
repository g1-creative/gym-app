import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPrograms } from '@/app/actions/programs'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, ArrowRight } from 'lucide-react'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const programs = await getPrograms()

  return (
    <PageLayout
      title="Programs"
      subtitle={programs && programs.length > 0 ? `${programs.length} ${programs.length === 1 ? 'program' : 'programs'}` : undefined}
      headerAction={
        <div className="flex gap-2">
          <Link href="/programs/premade">
            <Button variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto">
              Browse Templates
            </Button>
          </Link>
          <Link href="/programs/new">
            <Button className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              New
            </Button>
          </Link>
        </div>
      }
    >
      {programs && programs.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {programs.map((program: any) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="block"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{program.name}</h3>
                      {program.is_active && (
                        <span className="bg-green-500/20 text-green-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border border-green-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="text-xs sm:text-sm text-zinc-400 truncate">{program.description}</p>
                    )}
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                      Created {new Date(program.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
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
            <p className="text-base sm:text-lg text-zinc-300 mb-3 sm:mb-4">No programs yet</p>
            <Link href="/programs/new">
              <Button className="text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-2" />
                Create your first program
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

