# Premade Programs Setup Guide

## Step 1: Run Database Migration

The `is_premade` column needs to be added to the `programs` table. Run this SQL in your Supabase SQL editor:

```sql
-- Add is_premade column to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_premade BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_programs_is_premade ON programs(is_premade) WHERE is_premade = true AND deleted_at IS NULL;

-- Update RLS policy to allow viewing premade programs
-- All authenticated users can view premade programs
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT USING (is_premade = true AND deleted_at IS NULL);
```

**Note:** If the policy already exists, you may need to drop it first:
```sql
DROP POLICY IF EXISTS "Users can view premade programs" ON programs;
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT USING (is_premade = true AND deleted_at IS NULL);
```

## Step 2: Seed Premade Programs

1. Visit `/admin/seed-programs` in your app (while logged in)
2. Click the "Seed Programs" button
3. This will add all hardcoded premade programs to the database

## Step 3: Verify

1. Go to Programs page
2. Click "Browse Templates"
3. You should see the premade programs:
   - Push-Pull-Legs-Arms Split
   - Sam Sulek Twist

## Troubleshooting

### Programs not appearing
- Check if migration was run: Query `SELECT column_name FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'is_premade';`
- Check if programs were seeded: Query `SELECT * FROM programs WHERE is_premade = true;`
- Check RLS policies: Make sure the "Users can view premade programs" policy exists

### RLS Policy Conflicts
If you get permission errors, make sure the premade programs policy is created and doesn't conflict with existing policies. The policy should allow viewing programs where `is_premade = true` regardless of `user_id`.

