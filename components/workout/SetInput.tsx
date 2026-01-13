'use client'

import { useState, useEffect } from 'react'
import { SetInput as SetInputType } from '@/types'
import { kgToLbs, lbsToKg } from '@/lib/utils/weight'
import { Plus, Minus, Calculator } from 'lucide-react'

interface SetInputProps {
  onLog: (set: SetInputType) => void
  isLoading?: boolean
  defaultWeight?: number | null
  defaultReps?: number | null
  onOpenCalculator?: () => void
}

export function SetInput({ onLog, isLoading = false, defaultWeight, defaultReps, onOpenCalculator }: SetInputProps) {
  // Convert kg to lbs for display
  const defaultWeightLbs = defaultWeight ? kgToLbs(defaultWeight) : null
  const [weight, setWeight] = useState<string>(defaultWeightLbs?.toString() || '')
  const [reps, setReps] = useState<string>(defaultReps?.toString() || '')
  const [rpe, setRpe] = useState<string>('')
  const [tempo, setTempo] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Update weight when defaultWeight changes
  useEffect(() => {
    if (defaultWeight !== null && defaultWeight !== undefined) {
      const lbs = kgToLbs(defaultWeight)
      setWeight(lbs?.toString() || '')
    }
  }, [defaultWeight])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert lbs to kg for storage
    const weightLbs = weight ? parseFloat(weight) : null
    const weightKg = weightLbs ? lbsToKg(weightLbs) : null

    const setData: SetInputType = {
      weight: weightKg,
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
    <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5">
      {/* Weight and Reps - Main Input */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-medium text-zinc-300">Weight (lbs)</label>
            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Smart Plates Calculator"
              >
                <Calculator className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => incrementWeight(-5)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              step="5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => incrementWeight(5)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-1 justify-center">
            <button
              type="button"
              onClick={() => incrementWeight(-2.5)}
              className="text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1"
            >
              -2.5
            </button>
            <button
              type="button"
              onClick={() => incrementWeight(2.5)}
              className="text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1"
            >
              +2.5
            </button>
          </div>
        </div>

        {/* Reps */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-zinc-300">Reps</label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => incrementReps(-1)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => incrementReps(1)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RPE and Tempo */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">RPE (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">Tempo</label>
          <input
            type="text"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
            placeholder="2-0-1-0"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
          placeholder="Quick note..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || (!weight && !reps)}
        className="w-full bg-black hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base"
      >
        {isLoading ? 'Logging...' : 'Log Set'}
      </button>
    </form>
  )
}


