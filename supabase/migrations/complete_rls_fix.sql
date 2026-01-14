-- ============================================================================
-- COMPLETE RLS FIX - All UPDATE policies with WITH CHECK clauses
-- Run this ONCE to fix all soft-delete issues across all tables
-- ============================================================================

-- PROGRAMS TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
DROP POLICY IF EXISTS "Users can update own programs" ON programs;

CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND (is_premade IS NULL OR is_premade = false)
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND (is_premade IS NULL OR is_premade = false)
  );

-- WORKOUTS TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = workouts.program_id
      AND programs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = workouts.program_id
      AND programs.user_id = auth.uid()
    )
  );

-- WORKOUT_SESSIONS TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;

CREATE POLICY "Users can update own sessions" ON workout_sessions
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EXERCISES TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SETS TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own sets" ON sets;

CREATE POLICY "Users can update own sets" ON sets
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- NOTES TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own notes" ON notes;

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PROFILES TABLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  -- Count UPDATE policies without WITH CHECK
  SELECT COUNT(*) INTO missing_count
  FROM pg_policies 
  WHERE cmd = 'UPDATE'
    AND tablename IN ('programs', 'workouts', 'workout_sessions', 'exercises', 'sets', 'notes', 'profiles')
    AND with_check IS NULL;
  
  IF missing_count > 0 THEN
    RAISE WARNING '⚠️  Still have % UPDATE policies without WITH CHECK!', missing_count;
  ELSE
    RAISE NOTICE '✅ All UPDATE policies have WITH CHECK clauses!';
  END IF;
END $$;

-- Show summary of all UPDATE policies
SELECT 
  tablename,
  policyname,
  CASE WHEN with_check IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as status
FROM pg_policies 
WHERE cmd = 'UPDATE'
  AND tablename IN ('programs', 'workouts', 'workout_sessions', 'exercises', 'sets', 'notes', 'profiles')
ORDER BY 
  CASE WHEN with_check IS NULL THEN 0 ELSE 1 END,
  tablename;

