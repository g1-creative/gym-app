-- Fix workout_exercises RLS policy to include WITH CHECK clause

DROP POLICY IF EXISTS "Users can manage own workout exercises" ON workout_exercises;

CREATE POLICY "Users can manage own workout exercises" ON workout_exercises
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN programs ON programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
      AND programs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN programs ON programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
      AND programs.user_id = auth.uid()
    )
  );
