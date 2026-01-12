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

  // Get exercise name separately
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .select('name')
    .eq('id', exerciseId)
    .single()

  if (exerciseError) throw exerciseError
  if (!exercise) throw new Error('Exercise not found')

  // Type assertion needed because Supabase select with single field returns a narrowed type
  const exerciseName = (exercise as { name: string }).name

  // Type assertion for sets with joined data
  type SetWithSession = {
    volume: number | null
    weight: number | null
    reps: number | null
    workout_sessions: { started_at: string }
  }
  const typedSets = sets as SetWithSession[]

  const stats: ExerciseStats = {
    exerciseId,
    exerciseName,
    totalSets: typedSets.length,
    totalVolume: typedSets.reduce((sum, set) => sum + (set.volume || 0), 0),
    maxWeight: Math.max(...typedSets.map(s => s.weight || 0)),
    maxReps: Math.max(...typedSets.map(s => s.reps || 0)),
    maxVolume: Math.max(...typedSets.map(s => s.volume || 0)),
    averageWeight: typedSets.reduce((sum, s) => sum + (s.weight || 0), 0) / typedSets.length,
    averageReps: typedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / typedSets.length,
    prDate: null,
    lastSessionDate: typedSets[0] ? typedSets[0].workout_sessions.started_at : null,
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
  
  // Type assertion needed because Supabase select with single field returns a narrowed type
  const exerciseName = (exercise as { name: string }).name

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

  // Type assertion for sets with joined data
  type SetWithSession = {
    weight: number | null
    reps: number | null
    volume: number | null
    rpe: number | null
    workout_sessions: { started_at: string }
  }

  const lastSession = lastSessionSet
    ? {
        weight: (lastSessionSet as SetWithSession).weight,
        reps: (lastSessionSet as SetWithSession).reps,
        volume: (lastSessionSet as SetWithSession).volume,
        rpe: (lastSessionSet as SetWithSession).rpe,
        date: (lastSessionSet as SetWithSession).workout_sessions.started_at,
      }
    : { weight: null, reps: null, volume: null, rpe: null, date: null }

  const typedWeeklySets = (weeklySets || []) as SetWithSession[]
  const weeklyAverage = typedWeeklySets.length > 0
    ? {
        weight: typedWeeklySets.reduce((sum, s) => sum + (s.weight || 0), 0) / typedWeeklySets.length,
        reps: typedWeeklySets.reduce((sum, s) => sum + (s.reps || 0), 0) / typedWeeklySets.length,
        volume: typedWeeklySets.reduce((sum, s) => sum + (s.volume || 0), 0) / typedWeeklySets.length,
      }
    : { weight: null, reps: null, volume: null }

  const allTimePR = allTimeSets
    ? {
        weight: (allTimeSets as SetWithSession).weight,
        reps: (allTimeSets as SetWithSession).reps,
        volume: (allTimeSets as SetWithSession).volume,
        date: (allTimeSets as SetWithSession).workout_sessions.started_at,
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
    exerciseName,
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

  // Type assertion for sets with joined data
  type SetWithSessionForChart = {
    weight: number | null
    reps: number | null
    volume: number | null
    rpe: number | null
    workout_sessions: { started_at: string }
  }
  const typedSets = (sets || []) as SetWithSessionForChart[]

  // Group by date and calculate averages
  const dateMap = new Map<string, { weights: number[]; reps: number[]; volumes: number[]; rpes: number[] }>()

  typedSets.forEach((set) => {
    const date = new Date(set.workout_sessions.started_at).toISOString().split('T')[0]
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

