-- Debug script to check the specific program that's failing
-- Run this to see the program's details

SELECT 
  id,
  name,
  user_id,
  is_premade,
  deleted_at,
  created_at
FROM programs 
WHERE id = 'd8df4dac-3f21-44ca-85cd-921dcb4006d9';

-- Also check what the current policies are
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'programs'
  AND cmd = 'UPDATE'
ORDER BY policyname;

