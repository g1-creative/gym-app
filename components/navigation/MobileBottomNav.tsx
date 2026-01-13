"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { InteractiveMenu, InteractiveMenuItem } from "@/components/ui/modern-mobile-menu";
import { Home, Dumbbell, BarChart3, Calendar, FolderKanban } from 'lucide-react';

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  // Define your gym tracker navigation items
  const gymNavItems: InteractiveMenuItem[] = [
    { label: 'home', icon: Home },
    { label: 'workout', icon: Dumbbell },
    { label: 'programs', icon: FolderKanban },
    { label: 'analytics', icon: BarChart3 },
    { label: 'history', icon: Calendar },
  ];

  // Map routes to menu items
  const routes = ['/', '/workout/new', '/programs', '/analytics', '/history'];

  // Update active index based on current route
  useEffect(() => {
    const currentIndex = routes.findIndex(route => {
      if (route === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(route);
    });
    
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  // Handle navigation
  const handleNavigation = (index: number) => {
    setActiveIndex(index);
    router.push(routes[index]);
  };

  // Custom accent color using your primary color
  const accentColor = 'hsl(var(--primary))';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-background/80 backdrop-blur-lg border-t px-4 py-3">
        <div className="max-w-lg mx-auto">
          <InteractiveMenu 
            items={gymNavItems} 
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
}


