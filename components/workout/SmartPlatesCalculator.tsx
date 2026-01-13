'use client'

import { useState } from 'react'
import { X, Calculator } from 'lucide-react'
import { kgToLbs } from '@/lib/utils/weight'

interface SmartPlatesCalculatorProps {
  isOpen: boolean
  onClose: () => void
  targetWeight?: number | null // in kg
  onWeightSelect?: (weight: number) => void // in kg
}

// Standard plate weights in lbs
const PLATES_LBS = [45, 35, 25, 10, 5, 2.5]
const BAR_WEIGHT_LBS = 45

export function SmartPlatesCalculator({ isOpen, onClose, targetWeight, onWeightSelect }: SmartPlatesCalculatorProps) {
  const [inputWeight, setInputWeight] = useState<string>('')
  const [barWeight, setBarWeight] = useState<number>(BAR_WEIGHT_LBS)

  if (!isOpen) return null

  // Use targetWeight if provided, otherwise use input
  const weightLbs = targetWeight ? kgToLbs(targetWeight) : (inputWeight ? parseFloat(inputWeight) : null)
  
  const calculatePlates = (totalWeight: number) => {
    if (!totalWeight || totalWeight <= barWeight) {
      return { plates: [], total: barWeight, needed: 0 }
    }

    const neededWeight = totalWeight - barWeight
    const plates: { weight: number; count: number }[] = []
    let remaining = neededWeight

    // Calculate plates for each side (divide by 2)
    const platesPerSide = neededWeight / 2

    for (const plateWeight of PLATES_LBS) {
      const count = Math.floor(platesPerSide / plateWeight)
      if (count > 0) {
        plates.push({ weight: plateWeight, count })
        remaining -= plateWeight * count * 2
      }
    }

    return {
      plates,
      total: barWeight + plates.reduce((sum, p) => sum + p.weight * p.count * 2, 0),
      needed: neededWeight,
      remaining: Math.abs(remaining),
    }
  }

  const result = weightLbs ? calculatePlates(weightLbs) : null

  const handleUseWeight = () => {
    if (weightLbs && onWeightSelect) {
      // Convert lbs to kg
      const weightKg = weightLbs / 2.20462
      onWeightSelect(weightKg)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-white">Smart Plates Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {!targetWeight && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Enter weight"
                autoFocus
              />
            </div>
          )}

          {targetWeight && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Target Weight</div>
              <div className="text-lg font-semibold text-white">{weightLbs?.toFixed(1)} lbs</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Bar Weight (lbs)
            </label>
            <input
              type="number"
              value={barWeight}
              onChange={(e) => setBarWeight(parseFloat(e.target.value) || BAR_WEIGHT_LBS)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {result && result.needed > 0 && (
            <div className="space-y-3">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs text-zinc-400 mb-1">Plates Needed (per side)</div>
                <div className="space-y-1">
                  {result.plates.length > 0 ? (
                    result.plates.map((plate, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">
                          {plate.count}x {plate.weight} lbs
                        </span>
                        <span className="text-zinc-500">
                          = {plate.weight * plate.count} lbs
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-400">No plates needed</div>
                  )}
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs text-zinc-400 mb-1">Total Weight</div>
                <div className="text-lg font-semibold text-white">{result.total.toFixed(1)} lbs</div>
                {result.remaining > 0.1 && (
                  <div className="text-xs text-zinc-500 mt-1">
                    (Closest match, {result.remaining.toFixed(1)} lbs difference)
                  </div>
                )}
              </div>

              {onWeightSelect && (
                <button
                  onClick={handleUseWeight}
                  className="w-full bg-black hover:bg-zinc-900 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Use {result.total.toFixed(1)} lbs
                </button>
              )}
            </div>
          )}

          {result && result.needed <= 0 && weightLbs && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-sm text-yellow-400">
                Weight must be greater than bar weight ({barWeight} lbs)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

