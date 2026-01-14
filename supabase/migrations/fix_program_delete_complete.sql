-- COMPLETE FIX for program deletion RLS error
-- This handles all policies including premade programs

-- Step 1: Drop ALL existing policies on programs table to start clean
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
DROP POLICY IF EXISTS "Users can update own programs" ON programs;
DROP POLICY IF EXISTS "Users can view own programs" ON programs;
DROP POLICY IF EXISTS "Users can create own programs" ON programs;
DROP POLICY IF EXISTS "Users can view premade programs" ON programs;
DROP POLICY IF EXISTS "Users can create premade programs" ON programs;

-- Step 2: Recreate SELECT policies
-- Users can see their own programs
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- All authenticated users can see premade programs
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT 
  USING (is_premade = true AND deleted_at IS NULL);

-- Step 3: Recreate INSERT policies
-- Users can create their own programs
CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND (is_premade IS NULL OR is_premade = false));

-- Users can create premade programs (for seeding/admin)
CREATE POLICY "Users can create premade programs" ON programs
  FOR INSERT 
  WITH CHECK (
    is_premade = true AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Step 4: Recreate UPDATE policy - THE CRITICAL FIX
-- Users can update their own non-premade programs
-- This is what allows soft deletion via deleted_at
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

-- Step 5: Verify the setup
DO $$
DECLARE
  policy_count INTEGER;
  update_policy_count INTEGER;
BEGIN
  -- Count all policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'programs';
  
  -- Count UPDATE policies (should be at least 1)
  SELECT COUNT(*) INTO update_policy_count
  FROM pg_policies 
  WHERE tablename = 'programs' 
    AND cmd = 'UPDATE';
  
  RAISE NOTICE 'Total policies on programs table: %', policy_count;
  RAISE NOTICE 'UPDATE policies: %', update_policy_count;
  
  IF update_policy_count = 0 THEN
    RAISE EXCEPTION 'No UPDATE policies found on programs table!';
  END IF;
END $$;

-- Step 6: Display all policies for manual verification
SELECT 
  policyname,
  cmd,
  SUBSTRING(qual::text, 1, 80) as using_clause,
  SUBSTRING(with_check::text, 1, 80) as with_check_clause
FROM pg_policies 
WHERE tablename = 'programs'
ORDER BY cmd, policyname;

