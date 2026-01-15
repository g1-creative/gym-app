'use client'

import { useState, useEffect } from 'react'
import { Exercise } from '@/types'
import { PageLayout } from '@/components/layout/PageLayout'
import { ExerciseChart } from './ExerciseChart'
import { ChartDataPoint, ExerciseStats as ExerciseStatsType } from '@/types'
import { BarChart3, TrendingUp, Weight, Repeat, Calendar, Flame, Trophy, Activity } from 'lucide-react'
import { formatWeight, formatVolume } from '@/lib/utils/weight'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

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

const TIME_RANGES = [
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
]

export function AnalyticsClient({ exercises }: AnalyticsClientProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [stats, setStats] = useState<ExerciseStatsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(90)

  const handleExerciseSelect = async (exerciseId: string) => {
    setSelectedExercise(exerciseId)
    setError(null)
    setIsLoading(true)

    try {
      const [data, exerciseStats] = await Promise.all([
        fetchExerciseChartData(exerciseId, timeRange),
        fetchExerciseStats(exerciseId, timeRange),
      ])
      setChartData(data)
      setStats(exerciseStats)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics data. Please try again.')
      setStats(null)
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Reload data when time range changes
  useEffect(() => {
    if (selectedExercise) {
      handleExerciseSelect(selectedExercise)
    }
  }, [timeRange])

  const selectedExerciseName = exercises.find(e => e.id === selectedExercise)?.name || ''

  // Calculate additional insights
  const getInsights = () => {
    if (!stats || !chartData.length) return null

    const workoutDays = chartData.length
    const avgVolumePerDay = stats.totalVolume / workoutDays
    const consistency = (workoutDays / timeRange) * 100

    return {
      workoutDays,
      avgVolumePerDay,
      consistency,
    }
  }

  const insights = getInsights()

  return (
    <PageLayout
      title="Analytics"
      subtitle={selectedExercise ? selectedExerciseName : `Track your progress across ${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}`}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Exercise Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-zinc-200">
            Select Exercise
          </label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => handleExerciseSelect(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="">Choose an exercise...</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Selector - Only show when exercise is selected */}
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2"
          >
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  timeRange === range.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-zinc-900/50 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-xl p-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-pulse">
                  <div className="h-10 bg-zinc-800 rounded mb-2" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && selectedExercise && stats && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-xl p-4 hover:border-blue-600/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Repeat className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Sets</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalSets}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-600/20 rounded-xl p-4 hover:border-green-600/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Volume</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatVolume(stats.totalVolume)}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-600/20 rounded-xl p-4 hover:border-orange-600/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Weight className="h-4 w-4 text-orange-400" />
                    </div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Max Weight</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {stats.maxWeight ? formatWeight(stats.maxWeight) : 'N/A'}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 rounded-xl p-4 hover:border-purple-600/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Max Reps</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.maxReps || 'N/A'}</div>
                </motion.div>
              </div>

              {/* Additional Insights */}
              {insights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">Workout Days</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{insights.workoutDays}</div>
                    <p className="text-xs text-zinc-500 mt-1">in last {timeRange} days</p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">Avg Volume/Day</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatVolume(insights.avgVolumePerDay)}</div>
                    <p className="text-xs text-zinc-500 mt-1">per workout</p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">Consistency</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{insights.consistency.toFixed(1)}%</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {insights.consistency > 50 ? '🔥 Great job!' : insights.consistency > 25 ? 'Keep it up!' : 'Room to improve'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Last Session Info */}
              {stats.lastSessionDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-zinc-300">Last Workout</span>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {format(new Date(stats.lastSessionDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Charts */}
              {chartData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 gap-4"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center"
                >
                  <BarChart3 className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No workout data found for this time period</p>
                  <p className="text-sm text-zinc-500 mt-1">Try selecting a longer time range</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {!isLoading && !selectedExercise && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-600/20 blur-3xl" />
                  <BarChart3 className="h-20 w-20 text-blue-500 mx-auto relative" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Track Your Progress</h3>
                <p className="text-zinc-400 mb-2">Select an exercise to view detailed analytics</p>
                <p className="text-sm text-zinc-500">
                  {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} available
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  )
}
