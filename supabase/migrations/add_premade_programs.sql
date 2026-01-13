-- Add is_premade column to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_premade BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_programs_is_premade ON programs(is_premade) WHERE is_premade = true AND deleted_at IS NULL;

-- Update RLS policy to allow viewing premade programs
-- All authenticated users can view premade programs
CREATE POLICY "Users can view premade programs" ON programs
  FOR SELECT USING (is_premade = true AND deleted_at IS NULL);

-- Allow system to create premade programs (user_id can be NULL for premade)
-- This would typically be done by an admin or system user

