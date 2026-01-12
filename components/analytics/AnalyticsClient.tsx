'use client'

import { useState } from 'react'
import { Exercise } from '@/types'
// Note: These actions should be called from client components
// For now, we'll create wrapper functions that can be called from the client
async function fetchExerciseChartData(exerciseId: string, days = 90) {
  const res = await fetch(`/api/analytics/chart?exerciseId=${exerciseId}&days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return res.json()
}

async function fetchExerciseStats(exerciseId: string, days = 90) {
  const res = await fetch(`/api/analytics/stats?exerciseId=${exerciseId}&days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}
import { ExerciseChart } from './ExerciseChart'
import { ChartDataPoint, ExerciseStats as ExerciseStatsType } from '@/types'

interface AnalyticsClientProps {
  exercises: Exercise[]
}

export function AnalyticsClient({ exercises }: AnalyticsClientProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [stats, setStats] = useState<ExerciseStatsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExerciseSelect = async (exerciseId: string) => {
    setSelectedExercise(exerciseId)
    setIsLoading(true)

    try {
      const [data, exerciseStats] = await Promise.all([
        fetchExerciseChartData(exerciseId, 90),
        fetchExerciseStats(exerciseId, 90),
      ])
      setChartData(data)
      setStats(exerciseStats)
    } catch (error) {
      console.error('Error loading analytics:', error)
      alert('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6">Analytics</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Exercise
          </label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => handleExerciseSelect(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Choose an exercise...</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-slate-400">Loading analytics...</div>
        )}

        {!isLoading && selectedExercise && stats && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Total Sets</div>
                <div className="text-2xl font-bold">{stats.totalSets}</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Total Volume</div>
                <div className="text-2xl font-bold">{stats.totalVolume.toFixed(0)} kg</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Max Weight</div>
                <div className="text-2xl font-bold">
                  {stats.maxWeight ? `${stats.maxWeight} kg` : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Max Reps</div>
                <div className="text-2xl font-bold">{stats.maxReps || 'N/A'}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ExerciseChart
                data={chartData}
                dataKey="weight"
                title="Weight Progression"
                color="#0ea5e9"
              />
              <ExerciseChart
                data={chartData}
                dataKey="volume"
                title="Volume Progression"
                color="#10b981"
              />
              <ExerciseChart
                data={chartData}
                dataKey="reps"
                title="Reps Progression"
                color="#f59e0b"
              />
              <ExerciseChart
                data={chartData}
                dataKey="estimated1RM"
                title="Estimated 1RM"
                color="#ef4444"
              />
            </div>
          </>
        )}

        {!isLoading && !selectedExercise && (
          <div className="text-center py-12 text-slate-400">
            Select an exercise to view analytics
          </div>
        )}
      </div>
    </div>
  )
}

