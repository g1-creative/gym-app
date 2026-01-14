# Fix: Program Deletion RLS Policy Error (42501)

## The Problem

When trying to delete a program, you get this error:
```
Error Code 42501: new row violates row-level security policy for table "programs"
```

## Root Cause

The RLS (Row Level Security) policy for updating programs is missing an explicit `WITH CHECK` clause. When Supabase updates a row, it checks:
1. **USING clause**: Checks the OLD row (before update) - ✅ This works
2. **WITH CHECK clause**: Checks the NEW row (after update) - ❌ This is failing

Without an explicit `WITH CHECK` clause, Supabase may use the `USING` clause for both, but in some cases it needs to be explicit.

## The Solution

Run the migration SQL in your Supabase SQL Editor:

**Option 1: Run the migration file**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/fix_program_delete_rls.sql`
3. Click "Run"

**Option 2: Run this SQL directly**

```sql
-- Fix RLS policy for program deletion (soft delete)
-- Drop the existing delete policy (it's redundant with update policy)
DROP POLICY IF EXISTS "Users can delete own programs" ON programs;

-- Update the existing update policy to explicitly allow soft deletes
DROP POLICY IF EXISTS "Users can update own programs" ON programs;

CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE 
  USING (auth.uid() = user_id)  -- User must own the program (checks OLD row)
  WITH CHECK (auth.uid() = user_id);  -- After update, must still belong to user (allows setting deleted_at)
```

## What This Does

1. **Removes duplicate policy**: The "Users can delete own programs" policy was redundant
2. **Adds explicit WITH CHECK**: Ensures the new row (after setting `deleted_at`) still passes RLS checks
3. **Allows soft deletes**: Users can now update their programs to set `deleted_at` for soft deletion

## Verify It Worked

**Step 1: Verify the policy was updated**

Run this query in Supabase SQL Editor to check the policies:

```sql
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'programs' AND policyname = 'Users can update own programs';
```

You should see:
- `cmd` = `UPDATE`
- `using_clause` contains `auth.uid() = user_id`
- `with_check_clause` contains `auth.uid() = user_id` (THIS MUST NOT BE NULL!)

**Step 2: Test deletion**

After verifying the policy, try deleting a program. It should work without the 42501 error.

## If You Still Get Errors

If you still see RLS errors after running the migration:

1. **Verify the migration ran**: Check that the policy has a `with_check_clause` (see verification query above)
2. **Check authentication**: Verify the user is authenticated (check Vercel logs for auth errors)
3. **Check ownership**: Verify the program belongs to the user (check `user_id` matches `auth.uid()`)
4. **Check if already deleted**: Verify the program isn't already deleted (check `deleted_at IS NULL`)

## Troubleshooting

If the `with_check_clause` is NULL after running the migration, try running it again. Sometimes Supabase needs the policy to be dropped and recreated.

