'use client'

import { useState, useTransition } from 'react'
import { Program } from '@/types'
import { createSession } from '@/app/actions/sessions'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'

interface NewWorkoutClientProps {
  programs: Program[]
}

export function NewWorkoutClient({ programs }: NewWorkoutClientProps) {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStart = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        if (selectedProgram) formData.append('program_id', selectedProgram)
        if (selectedWorkout) formData.append('workout_id', selectedWorkout)

        const session = await createSession(formData)
        router.push('/workout/active')
        router.refresh()
      } catch (error) {
        console.error('Error starting workout:', error)
        alert('Failed to start workout. Please try again.')
      }
    })
  }

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
                setSelectedWorkout(null)
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
        </div>

        <Button
          onClick={handleStart}
          disabled={isPending}
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


