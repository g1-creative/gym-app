-- Add workout_day_number to track which iteration/cycle of a workout
-- This helps users track progress across multiple cycles of the same program
ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS workout_day_number INTEGER;

-- Create index for faster queries when filtering by workout and day
CREATE INDEX IF NOT EXISTS idx_sessions_workout_day ON workout_sessions(workout_id, workout_day_number) 
WHERE workout_id IS NOT NULL AND deleted_at IS NULL;

