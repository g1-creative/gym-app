# Gym Tracker PWA - Project Structure

## 📁 Folder Structure

```
gym-tracker/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── analytics.ts          # Analytics & progressive overload
│   │   ├── exercises.ts             # Exercise management
│   │   ├── programs.ts           # Program CRUD
│   │   ├── sessions.ts           # Workout session management
│   │   ├── sets.ts               # Set logging
│   │   └── workouts.ts           # Workout templates
│   ├── api/                      # API Routes
│   │   └── analytics/            # Analytics API endpoints
│   ├── analytics/                # Analytics page
│   ├── history/                  # Workout history page
│   ├── login/                    # Authentication page
│   ├── programs/                 # Programs management
│   ├── workout/                  # Workout pages
│   │   ├── active/              # Active workout view
│   │   └── new/                 # Start new workout
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # Client providers (SW registration)
│
├── components/                   # React Components
│   ├── analytics/                # Analytics components
│   │   ├── AnalyticsClient.tsx
│   │   ├── ExerciseChart.tsx
│   │   └── ProgressiveOverloadCard.tsx
│   ├── auth/                     # Authentication
│   │   └── LoginForm.tsx
│   ├── navigation/               # Navigation
│   │   └── Nav.tsx
│   └── workout/                  # Workout components
│       ├── ActiveWorkoutClient.tsx
│       ├── NewWorkoutClient.tsx
│       ├── RestTimer.tsx
│       └── SetInput.tsx
│
├── lib/                          # Utilities & Libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts            # Browser client
│   │   ├── middleware.ts        # Auth middleware
│   │   └── server.ts            # Server client
│   └── utils/                     # Utility functions
│       └── offline.ts           # Offline storage (IndexedDB)
│
├── public/                       # Static Assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icon-*.png                # PWA icons (to be created)
│
├── supabase/                     # Database
│   └── schema.sql                # Complete database schema
│
├── types/                        # TypeScript Types
│   ├── database.ts               # Supabase database types
│   └── index.ts                  # App-specific types
│
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── README.md                     # Project documentation
```

## 🔑 Key Files Explained

### Server Actions (`app/actions/`)
- All mutations use Server Actions for type-safe, secure operations
- Each file handles CRUD for a specific domain
- Includes validation with Zod schemas
- Automatic revalidation of Next.js cache

### Components
- **Client Components** (`'use client'`): Interactive UI, state management
- **Server Components**: Data fetching, initial render
- Separation follows Next.js 14 App Router best practices

### Database Schema (`supabase/schema.sql`)
- Normalized relational schema
- Row Level Security (RLS) policies
- Database triggers for calculated fields (volume, timestamps)
- Indexes for performance

### PWA Configuration
- `manifest.json`: App metadata, icons, display mode
- `sw.js`: Service worker for offline caching
- `app/providers.tsx`: Registers service worker on app load

## 🚀 Data Flow

1. **User Action** → Client Component
2. **Server Action** → Validates & Mutates Database
3. **Revalidation** → Next.js cache updates
4. **UI Update** → Optimistic updates + server refresh

## 🔐 Security

- **RLS Policies**: Database-level access control
- **Server Actions**: Server-side validation
- **Middleware**: Route protection
- **Type Safety**: TypeScript + Zod validation

## 📊 Analytics Flow

1. User selects exercise
2. Client fetches from `/api/analytics/*`
3. API routes call server actions
4. Server actions query Supabase
5. Data processed & returned
6. Charts render with Recharts

## 💾 Offline Support

- **IndexedDB**: Stores pending operations
- **Service Worker**: Caches static assets & API responses
- **Background Sync**: Syncs when back online (future enhancement)

## 🎨 Styling

- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Built-in with Tailwind
- **Mobile-First**: Responsive design
- **Touch Targets**: Minimum 44px for mobile

## 📱 PWA Features

- Installable on iOS, Android, Desktop
- Offline-first architecture
- App-like experience
- Push notifications ready (for rest timer alerts)


