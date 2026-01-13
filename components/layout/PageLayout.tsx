"use client";

import React, { useRef, useEffect } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function PageLayout({ title, subtitle, children, headerAction }: PageLayoutProps) {
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
      const screenArea = canvas.width * canvas.height;
      const count = screenArea < 400000 ? 
        Math.floor(screenArea / 15000) : 
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-x-hidden">
      <style>{`
        .page-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s cubic-bezier(.22,.61,.36,1) forwards;
        }
        
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s cubic-bezier(.22,.61,.36,1);
        }

        .page-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
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
        <header className="mb-4 sm:mb-6 page-animate">
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <img 
              src="/gymville-logo.png" 
              alt="Gymville" 
              className="h-6 sm:h-7 w-auto"
            />
            <span className="text-sm sm:text-base font-semibold text-white">
              Gymville
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{title}</h1>
              {subtitle && (
                <p className="text-zinc-400 text-xs sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-animate">
          {children}
        </div>
      </div>
    </div>
  );
}

