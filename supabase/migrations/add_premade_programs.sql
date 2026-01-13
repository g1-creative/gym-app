-- Make user_id nullable to allow premade programs (system-owned)
ALTER TABLE programs 
ALTER COLUMN user_id DROP NOT NULL;

-- Add is_premade column to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_premade BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_programs_is_premade ON programs(is_premade) WHERE is_premade = true AND deleted_at IS NULL;

-- Update RLS policy to allow viewing premade programs
-- All authenticated users can view premade programs
DROP POLICY IF EXISTS "Users can view premade programs" ON programs;
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT USING (is_premade = true AND deleted_at IS NULL);

-- Allow authenticated users to create premade programs (for seeding)
-- This allows the seed function to create programs with user_id = null and is_premade = true
CREATE POLICY "Users can create premade programs" ON programs
  FOR INSERT WITH CHECK (
    is_premade = true AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Update the existing "Users can view own programs" policy to also include premade programs
-- (The premade programs policy above already handles this, but we ensure no conflicts)

