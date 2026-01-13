'use client'

import { useState } from 'react'
import { Exercise } from '@/types'
import { PageLayout } from '@/components/layout/PageLayout'
import { ExerciseChart } from './ExerciseChart'
import { ChartDataPoint, ExerciseStats as ExerciseStatsType } from '@/types'
import { BarChart3, TrendingUp, Weight, Repeat } from 'lucide-react'
import { formatWeight, formatVolume } from '@/lib/utils/weight'

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

  const selectedExerciseName = exercises.find(e => e.id === selectedExercise)?.name || ''

  return (
    <PageLayout
      title="Analytics"
      subtitle={selectedExercise ? selectedExerciseName : `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'} available`}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Exercise Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
            Select Exercise
          </label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => handleExerciseSelect(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl text-zinc-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
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
          <div className="text-center py-8 sm:py-12">
            <div className="page-card rounded-lg sm:rounded-xl p-6 sm:p-8">
              <p className="text-sm sm:text-base text-zinc-400">Loading analytics...</p>
            </div>
          </div>
        )}

        {!isLoading && selectedExercise && stats && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                    <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{stats.totalSets}</div>
                <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Total Sets</div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">{formatVolume(stats.totalVolume)}</div>
                <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Total Volume</div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
                    <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {stats.maxWeight ? formatWeight(stats.maxWeight) : 'N/A'}
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Max Weight</div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{stats.maxReps || 'N/A'}</div>
                <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Max Reps</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <ExerciseChart
                  data={chartData}
                  dataKey="weight"
                  title="Weight Progression"
                  color="#0ea5e9"
                />
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <ExerciseChart
                  data={chartData}
                  dataKey="volume"
                  title="Volume Progression"
                  color="#10b981"
                />
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <ExerciseChart
                  data={chartData}
                  dataKey="reps"
                  title="Reps Progression"
                  color="#f59e0b"
                />
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <ExerciseChart
                  data={chartData}
                  dataKey="estimated1RM"
                  title="Estimated 1RM"
                  color="#ef4444"
                />
              </div>
            </div>
          </>
        )}

        {!isLoading && !selectedExercise && (
          <div className="text-center py-12">
            <div className="page-card rounded-lg sm:rounded-xl p-6 sm:p-8">
              <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-zinc-300 mb-2">Select an exercise to view analytics</p>
              <p className="text-xs sm:text-sm text-zinc-500">
                Choose from {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} above
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

