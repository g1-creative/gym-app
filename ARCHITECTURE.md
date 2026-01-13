# Gym Tracker PWA - Architecture Overview

## 🏗️ System Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Server Components + minimal client state
- **Charts**: Recharts

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **API**: Next.js Server Actions + API Routes
- **Security**: Row Level Security (RLS)

### Deployment
- **Platform**: Vercel
- **CDN**: Vercel Edge Network
- **Database**: Supabase Cloud

## 🔄 Request Flow

### Authenticated Request
```
User → Next.js Middleware → Supabase Auth Check
  ↓ (if authenticated)
Page Component → Server Action → Supabase RLS → Database
  ↓
Response → Client Component → UI Update
```

### Data Mutation
```
Client Component → Server Action
  ↓
Zod Validation → Supabase Insert/Update
  ↓
Database Trigger (volume calc, timestamps)
  ↓
Revalidate Path → Next.js Cache Update
  ↓
UI Refresh
```

## 🗄️ Database Design

### Core Entities
1. **Programs** - Training programs (user-owned)
2. **Workouts** - Workout templates (belong to programs)
3. **Exercises** - Exercise library (shared + custom)
4. **Workout Exercises** - Junction table (workouts ↔ exercises)
5. **Workout Sessions** - Actual logged workouts
6. **Sets** - Individual sets within sessions
7. **Notes** - Attachable notes (polymorphic)

### Relationships
```
Program → Workouts (1:N)
Workout → WorkoutExercises (1:N)
WorkoutExercise → Exercise (N:1)
WorkoutSession → Sets (1:N)
Set → Exercise (N:1)
```

### Calculated Fields
- **Set Volume**: `weight × reps` (database trigger)
- **Session Volume**: Sum of all set volumes (database trigger)
- **Session Duration**: Calculated on completion

## 🔐 Security Model

### Row Level Security (RLS)
Every table has RLS policies ensuring:
- Users can only access their own data
- Foreign key relationships respect ownership
- Soft deletes prevent data loss

### Example RLS Policy
```sql
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

### Server-Side Validation
- Zod schemas validate all inputs
- Type-safe operations with TypeScript
- Error handling at every layer

## 📱 PWA Architecture

### Service Worker Strategy
- **Cache First**: Static assets
- **Network First**: API calls (with cache fallback)
- **Background Sync**: Pending operations (future)

### Offline Storage
- **IndexedDB**: Pending operations queue
- **Cache API**: Static assets, API responses
- **Local Storage**: User preferences (optional)

### Sync Strategy
1. Log operations to IndexedDB when offline
2. Service worker detects online status
3. Background sync processes queue
4. Retry failed operations

## 🎯 Performance Optimizations

### Server Components
- Data fetching at component level
- Reduced client bundle size
- Faster initial page load

### Database Indexes
- User ID + deleted_at for filtered queries
- Exercise ID + logged_at for history queries
- Foreign key indexes for joins

### Caching Strategy
- Next.js automatic caching
- Supabase connection pooling
- Static asset caching via service worker

## 📊 Analytics Architecture

### Data Processing
1. Query sets for exercise (time-filtered)
2. Group by date
3. Calculate averages (weight, reps, volume)
4. Calculate estimated 1RM (Epley formula)
5. Return chart-ready data

### Progressive Overload Detection
1. Get current set data
2. Query last session for exercise
3. Query weekly average (last 7 days)
4. Query all-time PR
5. Compare and determine status (improved/maintained/regressed)

## 🔄 State Management

### Server State
- Managed by Next.js Server Components
- Automatic revalidation on mutations
- No client-side state needed for most data

### Client State
- Form inputs (controlled components)
- UI state (modals, timers)
- Optimistic updates for better UX

## 🧪 Testing Strategy (Future)

### Unit Tests
- Server actions
- Utility functions
- Component logic

### Integration Tests
- API routes
- Database operations
- Authentication flow

### E2E Tests
- Workout logging flow
- Progressive overload tracking
- Offline sync

## 🚀 Scalability Considerations

### Database
- Indexes on frequently queried columns
- Soft deletes (no hard deletes)
- Connection pooling via Supabase

### Application
- Server Components reduce client bundle
- API routes for heavy computations
- Pagination for large datasets

### Caching
- Next.js automatic caching
- Service worker for offline
- CDN for static assets

## 🔮 Future Enhancements

### Performance
- React Query for client-side caching
- Virtual scrolling for large lists
- Image optimization

### Features
- Real-time updates (Supabase Realtime)
- Push notifications
- Social features
- Export/import data

### Infrastructure
- Edge functions for heavy computations
- CDN for static assets
- Database read replicas (if needed)


