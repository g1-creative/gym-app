'use client'

import { useState } from 'react'
import { SetInput as SetInputType } from '@/types'

interface SetInputProps {
  onLog: (set: SetInputType) => void
  isLoading?: boolean
  defaultWeight?: number | null
  defaultReps?: number | null
}

export function SetInput({ onLog, isLoading = false, defaultWeight, defaultReps }: SetInputProps) {
  const [weight, setWeight] = useState<string>(defaultWeight?.toString() || '')
  const [reps, setReps] = useState<string>(defaultReps?.toString() || '')
  const [rpe, setRpe] = useState<string>('')
  const [tempo, setTempo] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const setData: SetInputType = {
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps) : null,
      rpe: rpe ? parseFloat(rpe) : null,
      tempo: tempo || null,
      notes: notes || null,
    }

    onLog(setData)

    // Reset form but keep weight/reps for quick logging
    setRpe('')
    setTempo('')
    setNotes('')
    // Keep weight and reps for next set
  }

  const incrementWeight = (amount: number) => {
    const current = parseFloat(weight) || 0
    setWeight(Math.max(0, current + amount).toString())
  }

  const incrementReps = (amount: number) => {
    const current = parseInt(reps) || 0
    setReps(Math.max(0, current + amount).toString())
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => incrementWeight(-2.5)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              -2.5
            </button>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => incrementWeight(2.5)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              +2.5
            </button>
          </div>
        </div>

        {/* Reps */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Reps</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => incrementReps(-1)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => incrementReps(1)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* RPE and Tempo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">RPE (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tempo</label>
          <input
            type="text"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 2-0-1-0"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Quick note..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || (!weight && !reps)}
        className="w-full bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isLoading ? 'Logging...' : 'Log Set'}
      </button>
    </form>
  )
}


