# Gym Tracker PWA - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to SQL Editor and run the schema from `supabase/schema.sql`

3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Create PWA Icons

Create the following icon files in the `public` directory:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can use any image editor or online tool to create these. They should be square PNG images with your app icon.

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

## Features Overview

### ✅ Implemented

- **Authentication**: Email/password sign up and sign in
- **Programs**: Create and manage training programs
- **Workouts**: Log workouts with exercises and sets
- **Set Logging**: Track weight, reps, RPE, tempo, and notes
- **Rest Timer**: Automatic rest timer after logging sets
- **Analytics**: Charts for weight, volume, reps, and estimated 1RM
- **Progressive Overload**: Compare current lifts vs last session, weekly average, and PRs
- **History**: View past workout sessions
- **PWA**: Offline-first with service worker and installable

### 🚧 Future Enhancements

- Exercise selector modal/search
- Program/workout templates
- Workout notes
- Exercise notes
- Social features (optional)
- Export data
- Custom exercise library
- Workout templates marketplace
- Advanced analytics (volume trends, periodization)
- Rest timer customization per exercise
- Superset tracking
- Drop sets, rest-pause sets
- Body measurements tracking
- Nutrition integration

## Database Schema

The app uses the following main tables:

- `programs` - Training programs
- `workouts` - Workout templates within programs
- `exercises` - Exercise library (custom + default)
- `workout_exercises` - Junction table linking workouts to exercises
- `workout_sessions` - Actual logged workout sessions
- `sets` - Individual sets logged during workouts
- `notes` - Notes attached to sets, exercises, or workouts

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Performance Considerations

- Server Components used where possible for better performance
- Optimistic UI updates for set logging
- IndexedDB for offline storage
- Service worker for offline caching
- Database indexes on frequently queried columns

## Security

- Supabase RLS policies enforce data isolation
- Server-side validation with Zod
- Client-side validation for better UX
- Secure cookie handling via Supabase SSR

