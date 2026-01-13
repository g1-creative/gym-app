# Gym Tracker PWA

A production-ready Progressive Web App for fitness tracking with progressive overload monitoring, rest timers, and comprehensive analytics.

## Features

- 📝 Log workouts and sets with weight, reps, RPE, and tempo
- 📈 Track progressive overload over time
- ⏱️ Automatic rest timers between sets
- 📊 Analytics and charts for performance tracking
- 📱 Offline-first PWA (installable on iOS, Android, Desktop)
- 🔐 Secure authentication with Supabase
- 💾 Local caching with background sync

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Charts**: Recharts
- **Deployment**: Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server actions)

3. Run database migrations:
```bash
# Apply the schema from supabase/schema.sql to your Supabase project
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
/lib              # Utilities, server actions, Supabase client
/types            # TypeScript types
/public           # Static assets, manifest, service worker
/supabase         # Database schema and migrations
```

## Key Features

### Workout Logging
- Quick set logging with minimal taps
- Support for weight, reps, RPE, tempo, and notes
- Auto-start rest timers after set completion

### Progressive Overload
- Compare current lifts vs last session, weekly average, and PRs
- Visual indicators for improvements and regressions
- Volume tracking (sets × reps × weight)

### Analytics
- Exercise history timeline
- Weight progression charts
- Volume trends
- Estimated 1RM calculations
- Personal records tracking

### Offline Support
- Log workouts offline
- Automatic sync when online
- Local caching of active workouts and history

## License

MIT


