"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Flame,
  ArrowRight,
  PlayCircle,
  FolderKanban,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatVolume } from '@/lib/utils/weight';

interface DashboardProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  activeSession?: {
    id: string;
    started_at: string;
    workout?: {
      name: string;
    };
  } | null;
  recentSessions: any[];
  programs: any[];
  stats?: {
    totalWorkouts: number;
    currentStreak: number;
    totalVolume: number;
    weeklyWorkouts: number;
  };
}

export default function ModernDashboard({ 
  user, 
  activeSession, 
  recentSessions, 
  programs,
  stats = {
    totalWorkouts: recentSessions.length,
    currentStreak: 0,
    totalVolume: 0,
    weeklyWorkouts: 0
  }
}: DashboardProps) {
  
  // Animated background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.2 + 0.05,
      o: Math.random() * 0.3 + 0.1,
    });

    const init = () => {
      ps = [];
      // Optimize particle count for smaller screens (390px width)
      const screenArea = canvas.width * canvas.height;
      const count = screenArea < 400000 ? 
        Math.floor(screenArea / 15000) : // Fewer particles on small screens
        Math.floor(screenArea / 12000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.2 + 0.05;
          p.o = Math.random() * 0.3 + 0.1;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.6, 2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete';
  const greeting = `Welcome back, ${userName}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-x-hidden">
      <style>{`
        .dashboard-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .dashboard-animate:nth-child(1) { animation-delay: 0.1s; }
        .dashboard-animate:nth-child(2) { animation-delay: 0.2s; }
        .dashboard-animate:nth-child(3) { animation-delay: 0.3s; }
        .dashboard-animate:nth-child(4) { animation-delay: 0.4s; }
        
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Optimizations for 390px width screens */
        @media (max-width: 390px) {
          .stat-card {
            padding: 0.625rem !important;
          }
          
          .action-card {
            padding: 0.75rem !important;
          }
          
          .active-workout-card {
            padding: 0.875rem !important;
          }
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s cubic-bezier(.22,.61,.36,1);
        }

        .stat-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .action-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s cubic-bezier(.22,.61,.36,1);
        }

        .action-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0,0,0,0.3);
        }

        .active-workout-card {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-2)) 100%);
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
        }

        .active-workout-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          to {
            left: 100%;
          }
        }
      `}</style>

      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none"
      />

      {/* Subtle vignette */}
      <div className="fixed inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.04),transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-lg pb-24 sm:pb-28">
        {/* Header */}
        <header className="mb-4 sm:mb-6 dashboard-animate">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
            <span className="text-[10px] sm:text-xs tracking-[0.14em] uppercase text-zinc-400">
              Gym Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{greeting}</h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        {/* Active Workout Alert */}
        {activeSession && (
          <Link
            href="/workout/active"
            className="block mb-4 sm:mb-6 dashboard-animate"
          >
            <div className="active-workout-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
                      Active Workout
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1 truncate">
                    {activeSession.workout?.name || 'Freestyle Session'}
                  </h2>
                  <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      Started {new Date(activeSession.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ml-2" />
              </div>
            </div>
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 dashboard-animate">
          <div className="stat-card rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalWorkouts}</div>
            <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Total Workouts</div>
          </div>

          <div className="stat-card rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Day Streak</div>
          </div>

          <div className="stat-card rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalVolume.toFixed(0)}</div>
            <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">Total Volume (kg)</div>
          </div>

          <div className="stat-card rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stats.weeklyWorkouts}</div>
            <div className="text-[10px] sm:text-xs text-zinc-400 leading-tight">This Week</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 sm:mb-6 dashboard-animate">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-zinc-300">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <Link href="/workout/new" className="block">
              <div className="action-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-50/10 flex-shrink-0">
                    <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">Start New Workout</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate">Begin your session</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 flex-shrink-0 ml-2" />
              </div>
            </Link>

            <Link href="/programs" className="block">
              <div className="action-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/10 flex-shrink-0">
                    <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">My Programs</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate">
                      {programs.length} {programs.length === 1 ? 'program' : 'programs'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 flex-shrink-0 ml-2" />
              </div>
            </Link>

            <Link href="/analytics" className="block">
              <div className="action-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-green-500/10 flex-shrink-0">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">Analytics</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 truncate">Track your progress</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 flex-shrink-0 ml-2" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Workouts */}
        {recentSessions && recentSessions.length > 0 && (
          <div className="dashboard-animate">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-300">Recent Activity</h2>
              <Link href="/history" className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
                View All
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {recentSessions.slice(0, 3).map((session: any) => (
                <Link
                  key={session.id}
                  href={`/workout/${session.id}`}
                  className="block"
                >
                  <div className="stat-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-800 flex-shrink-0">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-xs sm:text-sm truncate">
                          {session.workout?.name || 'Freestyle Workout'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                          {new Date(session.started_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {session.total_volume && (
                            <> • {formatVolume(session.total_volume)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 flex-shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

