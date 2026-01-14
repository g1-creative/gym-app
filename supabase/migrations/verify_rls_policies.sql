-- Verification query to check if RLS policies are set up correctly
-- Run this after applying fix_program_delete_rls.sql

-- Check all policies on programs table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,  -- This is the USING clause
  with_check  -- This is the WITH CHECK clause
FROM pg_policies 
WHERE tablename = 'programs'
ORDER BY policyname;

-- Expected result for "Users can update own programs":
-- - cmd should be 'UPDATE'
-- - qual should contain 'auth.uid() = user_id'
-- - with_check should contain 'auth.uid() = user_id' (THIS IS CRITICAL - must not be null)

