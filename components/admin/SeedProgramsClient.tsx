'use client'

import { useState, useTransition } from 'react'
import { seedPremadePrograms } from '@/app/actions/seed-premade-programs'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function SeedProgramsClient() {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<Array<{ success: boolean; program: string; error?: string }>>([])

  const handleSeed = () => {
    if (!confirm('This will seed premade programs into the database. Continue?')) {
      return
    }

    startTransition(async () => {
      try {
        const seedResults = await seedPremadePrograms()
        setResults(seedResults)
      } catch (error) {
        console.error('Error seeding programs:', error)
        alert('Failed to seed programs. Check console for details.')
      }
    })
  }

  return (
    <PageLayout
      title="Seed Premade Programs"
      subtitle="Add hardcoded premade programs to the database"
    >
      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <Database className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Database Seeding</h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                This will add all premade programs defined in the codebase to your database. 
                Programs that already exist will be skipped.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSeed}
            disabled={isPending}
            className="w-full sm:w-auto bg-black hover:bg-zinc-900 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Seed Programs
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Results</h3>
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded ${
                    result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs sm:text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.program}
                    </div>
                    {result.error && (
                      <div className="text-xs text-zinc-500 mt-1">{result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

