'use server'

import { createClient } from '@/lib/supabase/server'
import { ProgressiveOverloadComparison, ChartDataPoint, ExerciseStats } from '@/types'

// Calculate estimated 1RM using Epley formula: weight × (1 + reps/30)
function calculate1RM(weight: number, reps: number): number {
  if (reps === 0 || weight === 0) return 0
  return weight * (1 + reps / 30)
}

export async function getExerciseStats(exerciseId: string, days = 90) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // Get all sets for this exercise
  const { data: sets, error } = await supabase
    .from('sets')
    .select(`
      *,
      exercise:exercises(name),
      workout_sessions!inner(user_id, started_at)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .gte('workout_sessions.started_at', cutoffDate.toISOString())
    .is('deleted_at', null)
    .order('workout_sessions.started_at', { ascending: false })

  if (error) throw error

  if (!sets || sets.length === 0) {
    return null
  }

  const exerciseName = (sets[0].exercise as any).name

  const stats: ExerciseStats = {
    exerciseId,
    exerciseName,
    totalSets: sets.length,
    totalVolume: sets.reduce((sum, set) => sum + (set.volume || 0), 0),
    maxWeight: Math.max(...sets.map(s => s.weight || 0)),
    maxReps: Math.max(...sets.map(s => s.reps || 0)),
    maxVolume: Math.max(...sets.map(s => s.volume || 0)),
    averageWeight: sets.reduce((sum, s) => sum + (s.weight || 0), 0) / sets.length,
    averageReps: sets.reduce((sum, s) => sum + (s.reps || 0), 0) / sets.length,
    prDate: null,
    lastSessionDate: sets[0] ? (sets[0].workout_sessions as any).started_at : null,
  }

  return stats
}

export async function getProgressiveOverloadComparison(exerciseId: string, currentSet: { weight: number | null; reps: number | null; rpe: number | null; volume: number | null }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get exercise name
  const { data: exercise } = await supabase
    .from('exercises')
    .select('name')
    .eq('id', exerciseId)
    .single()

  if (!exercise) throw new Error('Exercise not found')

  // Get last session data
  const { data: lastSessionSet } = await supabase
    .from('sets')
    .select(`
      *,
      workout_sessions!inner(user_id, started_at)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .is('deleted_at', null)
    .order('workout_sessions.started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get weekly average (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: weeklySets } = await supabase
    .from('sets')
    .select(`
      *,
      workout_sessions!inner(user_id, started_at)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .gte('workout_sessions.started_at', weekAgo.toISOString())
    .is('deleted_at', null)

  // Get all-time PR
  const { data: allTimeSets } = await supabase
    .from('sets')
    .select(`
      *,
      workout_sessions!inner(user_id, started_at)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .is('deleted_at', null)
    .order('volume', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastSession = lastSessionSet
    ? {
        weight: lastSessionSet.weight,
        reps: lastSessionSet.reps,
        volume: lastSessionSet.volume,
        rpe: lastSessionSet.rpe,
        date: (lastSessionSet.workout_sessions as any).started_at,
      }
    : { weight: null, reps: null, volume: null, rpe: null, date: null }

  const weeklyAverage = weeklySets && weeklySets.length > 0
    ? {
        weight: weeklySets.reduce((sum, s) => sum + (s.weight || 0), 0) / weeklySets.length,
        reps: weeklySets.reduce((sum, s) => sum + (s.reps || 0), 0) / weeklySets.length,
        volume: weeklySets.reduce((sum, s) => sum + (s.volume || 0), 0) / weeklySets.length,
      }
    : { weight: null, reps: null, volume: null }

  const allTimePR = allTimeSets
    ? {
        weight: allTimeSets.weight,
        reps: allTimeSets.reps,
        volume: allTimeSets.volume,
        date: (allTimeSets.workout_sessions as any).started_at,
      }
    : { weight: null, reps: null, volume: null, date: null }

  // Determine status
  let status: 'improved' | 'maintained' | 'regressed' | 'new' = 'new'

  if (lastSession.volume && currentSet.volume) {
    if (currentSet.volume > lastSession.volume) {
      status = 'improved'
    } else if (currentSet.volume < lastSession.volume) {
      status = 'regressed'
    } else {
      status = 'maintained'
    }
  } else if (lastSession.volume) {
    status = 'new'
  }

  const comparison: ProgressiveOverloadComparison = {
    exerciseId,
    exerciseName: exercise.name,
    current: {
      weight: currentSet.weight,
      reps: currentSet.reps,
      volume: currentSet.volume,
      rpe: currentSet.rpe,
    },
    lastSession,
    weeklyAverage,
    allTimePR,
    status,
  }

  return comparison
}

export async function getExerciseChartData(exerciseId: string, days = 90): Promise<ChartDataPoint[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data: sets, error } = await supabase
    .from('sets')
    .select(`
      *,
      workout_sessions!inner(user_id, started_at)
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .gte('workout_sessions.started_at', cutoffDate.toISOString())
    .is('deleted_at', null)
    .order('workout_sessions.started_at', { ascending: true })

  if (error) throw error

  // Group by date and calculate averages
  const dateMap = new Map<string, { weights: number[]; reps: number[]; volumes: number[]; rpes: number[] }>()

  sets.forEach((set) => {
    const date = new Date((set.workout_sessions as any).started_at).toISOString().split('T')[0]
    if (!dateMap.has(date)) {
      dateMap.set(date, { weights: [], reps: [], volumes: [], rpes: [] })
    }
    const dayData = dateMap.get(date)!
    if (set.weight) dayData.weights.push(set.weight)
    if (set.reps) dayData.reps.push(set.reps)
    if (set.volume) dayData.volumes.push(set.volume)
    if (set.rpe) dayData.rpes.push(set.rpe)
  })

  const chartData: ChartDataPoint[] = Array.from(dateMap.entries()).map(([date, data]) => {
    const avgWeight = data.weights.length > 0 ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null
    const avgReps = data.reps.length > 0 ? data.reps.reduce((a, b) => a + b, 0) / data.reps.length : null
    const avgVolume = data.volumes.length > 0 ? data.volumes.reduce((a, b) => a + b, 0) / data.volumes.length : null
    const avgRPE = data.rpes.length > 0 ? data.rpes.reduce((a, b) => a + b, 0) / data.rpes.length : null

    const estimated1RM = avgWeight && avgReps ? calculate1RM(avgWeight, avgReps) : null

    return {
      date,
      weight: avgWeight,
      reps: avgReps,
      volume: avgVolume,
      rpe: avgRPE,
      estimated1RM,
    }
  })

  return chartData
}

