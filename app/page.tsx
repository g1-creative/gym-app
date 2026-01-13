import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveSession, getSessions } from './actions/sessions'
import { getPrograms } from './actions/programs'
import ModernDashboard from '@/components/dashboard/ModernDashboard'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Calculate stats from sessions
function calculateStats(sessions: any[]) {
  const completedSessions = sessions.filter(s => s.completed_at);
  
  // Total workouts
  const totalWorkouts = completedSessions.length;
  
  // Total volume
  const totalVolume = completedSessions.reduce((sum, s) => sum + (s.total_volume || 0), 0);
  
  // Current streak (consecutive days with workouts)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedSessions = [...completedSessions].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  
  let checkDate = new Date(today);
  const sessionDates = new Set(
    sortedSessions.map(s => {
      const d = new Date(s.completed_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  
  // Check if there's a workout today or yesterday to start counting
  if (sessionDates.has(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!sessionDates.has(checkDate.getTime())) {
      return { totalWorkouts, currentStreak: 0, totalVolume, weeklyWorkouts: 0 };
    }
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Count backwards
  while (sessionDates.has(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Weekly workouts (last 7 days)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyWorkouts = completedSessions.filter(
    s => new Date(s.completed_at) >= weekAgo
  ).length;
  
  return {
    totalWorkouts,
    currentStreak,
    totalVolume,
    weeklyWorkouts
  };
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // Route protection: Use getUser() for REAL auth validation (not getSession!)
  // getUser() validates the session with Supabase API
  // getSession() only reads cookies and can be stale/spoofed
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [activeSession, recentSessions, programs, allSessions] = await Promise.all([
    getActiveSession(),
    getSessions(5),
    getPrograms(),
    getSessions(100), // Get more sessions for stats calculation
  ])

  const stats = calculateStats(allSessions);

  return (
    <ModernDashboard
      user={user}
      activeSession={activeSession}
      recentSessions={recentSessions}
      programs={programs}
      stats={stats}
    />
  )
}

