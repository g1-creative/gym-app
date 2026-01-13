export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          program_id: string
          name: string
          description: string | null
          order_index: number
          rest_timer_seconds: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          description?: string | null
          order_index?: number
          rest_timer_seconds?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          description?: string | null
          order_index?: number
          rest_timer_seconds?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string | null
          name: string
          muscle_groups: string[] | null
          equipment: string | null
          is_custom: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          muscle_groups?: string[] | null
          equipment?: string | null
          is_custom?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          muscle_groups?: string[] | null
          equipment?: string | null
          is_custom?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          order_index: number
          rest_timer_seconds: number | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          order_index?: number
          rest_timer_seconds?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          order_index?: number
          rest_timer_seconds?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          program_id: string | null
          workout_id: string | null
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          total_volume: number | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          program_id?: string | null
          workout_id?: string | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          total_volume?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string | null
          workout_id?: string | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          total_volume?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      sets: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          workout_exercise_id: string | null
          set_number: number
          weight: number | null
          reps: number | null
          rpe: number | null
          tempo: string | null
          rest_seconds: number | null
          volume: number | null
          notes: string | null
          logged_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          workout_exercise_id?: string | null
          set_number: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          tempo?: string | null
          rest_seconds?: number | null
          volume?: number | null
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          workout_exercise_id?: string | null
          set_number?: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          tempo?: string | null
          rest_seconds?: number | null
          volume?: number | null
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          entity_type: string
          entity_id: string
          content: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: string
          entity_id: string
          content: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}


