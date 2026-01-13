'use client'

import { useState, useTransition } from 'react'
import { Program } from '@/types'
import { createSession } from '@/app/actions/sessions'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Start New Workout</h1>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Program (Optional)
            </label>
            <select
              value={selectedProgram || ''}
              onChange={(e) => {
                setSelectedProgram(e.target.value || null)
                setSelectedWorkout(null)
              }}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Freestyle Workout</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={isPending}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isPending ? 'Starting...' : 'Start Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}


