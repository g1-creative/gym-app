# Environment Variables Setup

## Required Variables

For the Gym Tracker app to work, you need these environment variables:

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Your value**: `https://ipmhmdlxgfhkdeyvkabc.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL
- **Usage**: Public URL, safe to expose in client-side code

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Your value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbWhtZGx4Z2Zoa2RleXZrYWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAzOTMsImV4cCI6MjA4MzgwNjM5M30.faEwP8L0gHnhHXRroAUQTcvJGhoE3v2XmLuHPRyd6hM`
- **Where to find**: Supabase Dashboard → Project Settings → API → anon/public key
- **Usage**: Public key, safe to expose in client-side code (protected by RLS)

### 3. `SUPABASE_SERVICE_ROLE_KEY` (Optional)
- **Your value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbWhtZGx4Z2Zoa2RleXZrYWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzMDM5MywiZXhwIjoyMDgzODA2MzkzfQ.GcYfhRpuoFJdnSpLkkAZ4jSgxQq7D0RfNi0doU0VciU`
- **Where to find**: Supabase Dashboard → Project Settings → API → service_role key
- **Usage**: Secret key, bypasses RLS - **NEVER expose this in client-side code!**
- **Note**: Currently not used in this app, but good to have for future admin features

## Setup Steps

1. **Create `.env.local` file** in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your values** to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ipmhmdlxgfhkdeyvkabc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbWhtZGx4Z2Zoa2RleXZrYWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAzOTMsImV4cCI6MjA4MzgwNjM5M30.faEwP8L0gHnhHXRroAUQTcvJGhoE3v2XmLuHPRyd6hM
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbWhtZGx4Z2Zoa2RleXZrYWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzMDM5MywiZXhwIjoyMDgzODA2MzkzfQ.GcYfhRpuoFJdnSpLkkAZ4jSgxQq7D0RfNi0doU0VciU
   ```

3. **Restart your dev server** if it's running:
   ```bash
   npm run dev
   ```

## Security Notes

⚠️ **IMPORTANT**: 
- `.env.local` is already in `.gitignore` - it will NOT be committed to git
- Never commit actual credentials to version control
- The `NEXT_PUBLIC_*` variables are safe to expose (they're public by design)
- The `SUPABASE_SERVICE_ROLE_KEY` is secret - keep it private!

## Variables NOT Needed

These variables from your Supabase setup are **NOT needed** for this Next.js app:
- `POSTGRES_*` - Direct database connection (we use Supabase client)
- `SUPABASE_JWT_SECRET` - Internal Supabase config
- `SUPABASE_PUBLISHABLE_KEY` - Alternative naming, use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead
- `SUPABASE_SECRET_KEY` - Alternative naming
- `SUPABASE_URL` - Use `NEXT_PUBLIC_SUPABASE_URL` instead

## For Production (Vercel)

When deploying to Vercel:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the same three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)


