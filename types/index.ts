import { Database } from './database'

export type Program = Database['public']['Tables']['programs']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type Set = Database['public']['Tables']['sets']['Row']
export type Note = Database['public']['Tables']['notes']['Row']

// Extended types with relations
export interface ProgramWithWorkouts extends Program {
  workouts: WorkoutWithExercises[]
}

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExerciseWithExercise[]
}

export interface WorkoutExerciseWithExercise extends WorkoutExercise {
  exercise: Exercise
}

export interface WorkoutSessionWithSets extends WorkoutSession {
  sets: SetWithExercise[]
  program?: Program | null
  workout?: Workout | null
}

export interface SetWithExercise extends Set {
  exercise: Exercise
}

// Form/Input types
export interface SetInput {
  weight?: number | null
  reps?: number | null
  rpe?: number | null
  tempo?: string | null
  notes?: string | null
}

export interface ExerciseStats {
  exerciseId: string
  exerciseName: string
  totalSets: number
  totalVolume: number
  maxWeight: number | null
  maxReps: number | null
  maxVolume: number | null
  averageWeight: number | null
  averageReps: number | null
  prDate: string | null
  lastSessionDate: string | null
}

export interface ProgressiveOverloadComparison {
  exerciseId: string
  exerciseName: string
  current: {
    weight: number | null
    reps: number | null
    volume: number | null
    rpe: number | null
  }
  lastSession: {
    weight: number | null
    reps: number | null
    volume: number | null
    rpe: number | null
    date: string | null
  }
  weeklyAverage: {
    weight: number | null
    reps: number | null
    volume: number | null
  }
  allTimePR: {
    weight: number | null
    reps: number | null
    volume: number | null
    date: string | null
  }
  status: 'improved' | 'maintained' | 'regressed' | 'new'
}

export interface ChartDataPoint {
  date: string
  weight: number | null
  reps: number | null
  volume: number | null
  rpe: number | null
  estimated1RM: number | null
}


