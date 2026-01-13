# Supabase Database Setup Guide

## Quick Setup Steps

1. **Go to your Supabase project**
   - Navigate to [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the SQL**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `profiles`
     - `programs`
     - `workouts`
     - `exercises`
     - `workout_exercises`
     - `workout_sessions`
     - `sets`
     - `notes`

5. **Verify RLS is enabled**
   - Click on any table
   - Check that "Enable RLS" is toggled ON (green)

## What the SQL Does

### Tables Created
- **profiles** - User profile data (extends auth.users)
- **programs** - Training programs
- **workouts** - Workout templates
- **exercises** - Exercise library (shared + custom)
- **workout_exercises** - Links workouts to exercises
- **workout_sessions** - Actual logged workouts
- **sets** - Individual sets within sessions
- **notes** - Attachable notes

### Security (RLS)
- Row Level Security enabled on all tables
- Users can only access their own data
- Policies enforce data isolation

### Automatic Features
- **Auto-calculated fields**: Set volume (weight × reps), session total volume
- **Auto-timestamps**: `created_at` and `updated_at` automatically maintained
- **Soft deletes**: Records marked with `deleted_at` instead of hard deletion

### Performance
- Indexes on frequently queried columns
- Optimized for user-scoped queries

## Troubleshooting

### If you get an error about uuid-ossp:
The extension should already be enabled in Supabase, but if not, run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### If tables already exist:
The SQL uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. However, if you need to start fresh:
1. Drop tables in reverse order (sets → notes → workout_sessions → etc.)
2. Or use Supabase's "Reset Database" feature (⚠️ This deletes ALL data)

### Verify RLS Policies:
After running, check that RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'programs', 'workouts', 'exercises', 'workout_exercises', 'workout_sessions', 'sets', 'notes');
```

All should show `rowsecurity = true`.


