# Debug: Program Delete RLS Error (42501)

## Problem
Error when deleting programs: `new row violates row-level security policy for table "programs"`

## Root Cause
The `add_premade_programs.sql` migration added new policies but didn't update the UPDATE policy. When you have multiple RLS policies, **ALL of them must pass** for an operation to succeed.

The issue:
- ✅ `"Users can view own programs"` - has correct policy
- ✅ `"Users can view premade programs"` - has correct policy  
- ✅ `"Users can create own programs"` - has correct policy
- ✅ `"Users can create premade programs"` - has correct policy
- ❌ `"Users can update own programs"` - **MISSING WITH CHECK clause or not handling is_premade correctly**

## The Fix

### Step 1: Run the Complete Fix Migration

Go to your Supabase Dashboard → SQL Editor and run:

**File**: `supabase/migrations/fix_program_delete_complete.sql`

Or copy/paste this:

```sql
-- COMPLETE FIX for program deletion RLS error
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
DROP POLICY IF EXISTS "Users can update own programs" ON programs;
DROP POLICY IF EXISTS "Users can view own programs" ON programs;
DROP POLICY IF EXISTS "Users can create own programs" ON programs;
DROP POLICY IF EXISTS "Users can view premade programs" ON programs;
DROP POLICY IF EXISTS "Users can create premade programs" ON programs;

-- SELECT policies
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT 
  USING (is_premade = true AND deleted_at IS NULL);

-- INSERT policies
CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND (is_premade IS NULL OR is_premade = false));

CREATE POLICY "Users can create premade programs" ON programs
  FOR INSERT 
  WITH CHECK (
    is_premade = true AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- UPDATE policy - THE CRITICAL FIX
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
```

### Step 2: Verify the Fix

Run this query to check all policies:

```sql
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'programs'
ORDER BY cmd, policyname;
```

**Expected Output:**

You should see:
- 2 SELECT policies (view own, view premade)
- 2 INSERT policies (create own, create premade)
- 1 UPDATE policy (update own) - **with_check_clause should NOT be null**

### Step 3: Test the Delete

After running the migration, try deleting a program again.

## Why This Happens

**RLS Policy Evaluation:**
- When you UPDATE a row (including soft delete with `deleted_at`), Postgres checks:
  1. **USING clause**: Can you access the OLD row? (before update)
  2. **WITH CHECK clause**: Is the NEW row valid? (after update)

**Multiple Policies:**
- When there are multiple policies for the same operation (e.g., multiple UPDATE policies), **ALL must pass**
- If one policy is missing `WITH CHECK`, it might implicitly fail

**The Fix:**
- Explicitly set both `USING` and `WITH CHECK` clauses
- Ensure the UPDATE policy handles `is_premade` flag correctly
- User can only update their own non-premade programs

## If It Still Doesn't Work

### Check Current Policies
```sql
\d+ programs
```

### Check if RLS is enabled
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'programs';
```

### Check Auth Context
```sql
-- This should return your user ID when logged in
SELECT auth.uid();
```

### Test Query Directly
```sql
-- This should work without errors
UPDATE programs 
SET deleted_at = NOW() 
WHERE id = 'your-program-id' 
  AND user_id = auth.uid();
```

## Additional Notes

- The error occurs in **production (Vercel)**, not locally
- The stack trace shows `/var/task/` which confirms it's serverless
- Make sure you ran the migration on your **production Supabase database**, not local
- You might need to redeploy your Vercel app after fixing the database (though this shouldn't be necessary)

