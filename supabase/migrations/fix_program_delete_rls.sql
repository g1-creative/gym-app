-- Fix RLS policy for program deletion (soft delete)
-- The issue is that the UPDATE policy needs to explicitly allow setting deleted_at
-- 
-- RLS Policy Explanation:
-- - USING clause: Checks the OLD row (before update) - user must own the program
-- - WITH CHECK clause: Checks the NEW row (after update) - must still belong to user
--   This allows setting deleted_at while ensuring the program still belongs to the user

-- Drop the existing delete policy (it's redundant with update policy)
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;

-- Update the existing update policy to explicitly allow soft deletes
DROP POLICY IF EXISTS "Users can update own programs" ON programs;

CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE 
  USING (auth.uid() = user_id)  -- User must own the program (checks OLD row)
  WITH CHECK (auth.uid() = user_id);  -- After update, must still belong to user (allows setting deleted_at)

-- Verify the policy was created correctly
-- Run this query to check: SELECT * FROM pg_policies WHERE tablename = 'programs' AND policyname = 'Users can update own programs';

