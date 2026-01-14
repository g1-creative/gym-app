-- Check ALL UPDATE policies across all tables
-- This will show if any are missing WITH CHECK clauses

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN '❌ MISSING'
    ELSE '✅ HAS WITH CHECK'
  END as with_check_status,
  SUBSTRING(qual::text, 1, 50) as using_clause,
  SUBSTRING(with_check::text, 1, 50) as with_check_clause
FROM pg_policies 
WHERE cmd = 'UPDATE'
  AND tablename IN ('programs', 'workouts', 'workout_sessions', 'exercises', 'sets', 'notes', 'profiles', 'workout_exercises')
ORDER BY 
  CASE WHEN with_check IS NULL THEN 0 ELSE 1 END,  -- Missing WITH CHECK first
  tablename, 
  policyname;

