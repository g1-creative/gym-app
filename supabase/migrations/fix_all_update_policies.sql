-- FIX ALL UPDATE POLICIES - Add WITH CHECK clauses for soft deletes
-- This fixes RLS errors on programs, workouts, workout_sessions, exercises, sets, and notes

-- ============================================================================
-- WORKOUTS TABLE
-- ============================================================================
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

-- ============================================================================
-- WORKOUT_SESSIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;

CREATE POLICY "Users can update own sessions" ON workout_sessions
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EXERCISES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SETS TABLE
-- ============================================================================
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

-- ============================================================================
-- NOTES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own notes" ON notes;

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PROFILES TABLE (already has UPDATE policy, but let's ensure it's correct)
-- ============================================================================
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
  tables_checked TEXT[] := ARRAY['programs', 'workouts', 'workout_sessions', 'exercises', 'sets', 'notes', 'profiles'];
  table_name TEXT;
  update_policy_count INTEGER;
  policies_without_check INTEGER;
BEGIN
  FOREACH table_name IN ARRAY tables_checked
  LOOP
    -- Count UPDATE policies
    SELECT COUNT(*) INTO update_policy_count
    FROM pg_policies 
    WHERE tablename = table_name AND cmd = 'UPDATE';
    
    -- Count UPDATE policies without WITH CHECK
    SELECT COUNT(*) INTO policies_without_check
    FROM pg_policies 
    WHERE tablename = table_name 
      AND cmd = 'UPDATE' 
      AND with_check IS NULL;
    
    RAISE NOTICE '% - UPDATE policies: %, without WITH CHECK: %', 
      table_name, update_policy_count, policies_without_check;
      
    IF policies_without_check > 0 THEN
      RAISE WARNING 'Table % still has UPDATE policies without WITH CHECK clause!', table_name;
    END IF;
  END LOOP;
END $$;

-- Display all UPDATE policies for manual review
SELECT 
  tablename,
  policyname,
  SUBSTRING(qual::text, 1, 60) as using_clause,
  SUBSTRING(with_check::text, 1, 60) as with_check_clause
FROM pg_policies 
WHERE cmd = 'UPDATE'
  AND tablename IN ('programs', 'workouts', 'workout_sessions', 'exercises', 'sets', 'notes', 'profiles')
ORDER BY tablename, policyname;

