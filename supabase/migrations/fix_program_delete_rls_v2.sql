-- Fix RLS policy for program deletion (soft delete) - V2
-- This version is more explicit and handles edge cases

-- Step 1: Drop ALL existing policies on programs table
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
DROP POLICY IF EXISTS "Users can update own programs" ON programs;
DROP POLICY IF EXISTS "Users can view own programs" ON programs;
DROP POLICY IF EXISTS "Users can create own programs" ON programs;

-- Step 2: Recreate all policies with explicit WITH CHECK clauses

-- SELECT policy: Users can only see their own non-deleted programs
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT policy: Users can only create programs for themselves
CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own programs
-- This is the CRITICAL policy for soft deletes
CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE 
  USING (auth.uid() = user_id)  -- Must own the program before update
  WITH CHECK (auth.uid() = user_id);  -- Must still own it after update (allows deleted_at)

-- Step 3: Verify the policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'programs';
  
  IF policy_count != 3 THEN
    RAISE EXCEPTION 'Expected 3 policies on programs table, but found %', policy_count;
  END IF;
  
  RAISE NOTICE 'Successfully created % policies on programs table', policy_count;
END $$;

-- Step 4: Display all policies for verification
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'programs'
ORDER BY policyname;

