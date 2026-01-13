'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { copyPremadeProgram } from '@/app/actions/premade-programs'
import { Calendar, Plus, Sparkles, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

interface PremadeProgramsClientProps {
  programs: any[]
}

export function PremadeProgramsClient({ programs }: PremadeProgramsClientProps) {
  const [copiedPrograms, setCopiedPrograms] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAddProgram = async (programId: string) => {
    startTransition(async () => {
      try {
        const newProgram = await copyPremadeProgram(programId)
        setCopiedPrograms((prev) => new Set([...prev, programId]))
        // Redirect to the new program
        router.push(`/programs/${newProgram.id}`)
        router.refresh()
      } catch (error) {
        console.error('Error adding program:', error)
        alert('Failed to add program. Please try again.')
      }
    })
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-6 sm:p-8">
          <Sparkles className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-zinc-300 mb-2">No premade programs available</p>
          <div className="text-sm text-zinc-500 mb-4 space-y-2">
            <p>
              The premade programs are hardcoded in the app but need to be added to the database.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-left mt-4">
              <p className="text-xs text-blue-400 font-semibold mb-2">Setup Required:</p>
              <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Run the database migration (add is_premade column) - See PREMADE_PROGRAMS_SETUP.md</li>
                <li>Programs will auto-seed when you visit this page, or manually seed at /admin/seed-programs</li>
              </ol>
            </div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link href="/admin/seed-programs">
              <Button className="text-sm sm:text-base">
                Manual Seed
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="text-sm sm:text-base">
                Back to Programs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Ready-to-Use Programs</h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Browse our collection of professionally designed workout programs. Add any program to your account and customize it to fit your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {programs.map((program: any) => {
          const isCopied = copiedPrograms.has(program.id)
          const workoutCount = program.workouts?.length || 0

          return (
            <div
              key={program.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 text-white">{program.name}</h3>
                    {program.description && (
                      <p className="text-xs sm:text-sm text-zinc-400 mb-3">{program.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-500">
                      {workoutCount > 0 && (
                        <span>{workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isCopied ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Check className="h-4 w-4" />
                      <span>Added</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAddProgram(program.id)}
                      disabled={isPending}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto bg-black hover:bg-zinc-900 text-white"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      Add to My Programs
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <Link href="/programs">
          <Button variant="outline" className="w-full text-sm sm:text-base">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to My Programs
          </Button>
        </Link>
      </div>
    </div>
  )
}

