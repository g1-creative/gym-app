# Fix: Premade Programs Not Appearing

## The Problem
The premade programs aren't appearing because:
1. The `user_id` column in `programs` table is `NOT NULL`, but premade programs need `user_id = NULL`
2. The RLS policy blocks creating programs with `user_id = NULL`

## The Solution

Run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Make user_id nullable (required for premade programs)
ALTER TABLE programs 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Add is_premade column (if not already added)
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_premade BOOLEAN DEFAULT false;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_programs_is_premade ON programs(is_premade) 
WHERE is_premade = true AND deleted_at IS NULL;

-- Step 4: Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view premade programs" ON programs;

-- Step 5: Create policy to view premade programs
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT USING (is_premade = true AND deleted_at IS NULL);

-- Step 6: Create policy to allow seeding premade programs
DROP POLICY IF EXISTS "Users can create premade programs" ON programs;
CREATE POLICY "Users can create premade programs" ON programs
  FOR INSERT WITH CHECK (
    is_premade = true AND 
    (user_id IS NULL OR user_id = auth.uid())
  );
```

## After Running the Migration

1. Visit `/programs/premade` in your app
2. The programs should auto-seed automatically
3. If they don't appear, visit `/admin/seed-programs` and click "Seed Programs"

## Verify It Worked

Run this query in Supabase SQL Editor:
```sql
SELECT id, name, is_premade, user_id 
FROM programs 
WHERE is_premade = true;
```

You should see 2 programs:
- Push-Pull-Legs-Arms Split
- Sam Sulek Twist

