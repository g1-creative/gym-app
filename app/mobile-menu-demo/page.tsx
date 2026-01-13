"use client";

import React from 'react';
import { InteractiveMenu, InteractiveMenuItem } from "@/components/ui/modern-mobile-menu";
import { Home, Dumbbell, BarChart3, Calendar, User } from 'lucide-react';

export default function MobileMenuDemoPage() {
  // Gym Tracker customized menu items
  const gymTrackerMenuItems: InteractiveMenuItem[] = [
    { label: 'home', icon: Home },
    { label: 'workout', icon: Dumbbell },
    { label: 'analytics', icon: BarChart3 },
    { label: 'history', icon: Calendar },
    { label: 'profile', icon: User },
  ];

  const customAccentColor = 'hsl(var(--chart-2))';

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col gap-8">
      {/* Page Header */}
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Mobile Menu Demo</h1>
        <p className="text-muted-foreground">
          Interactive mobile navigation menu for your gym tracker
        </p>
      </div>

      {/* Demo Section 1: Default */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Default Menu</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Using default items and colors
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <InteractiveMenu />
        </div>
      </div>

      {/* Demo Section 2: Gym Tracker Customized */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Gym Tracker Navigation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customized for gym tracking with workout-specific icons and accent color
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <InteractiveMenu items={gymTrackerMenuItems} accentColor={customAccentColor} />
        </div>
      </div>

      {/* Demo Section 3: Mobile Preview */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Mobile Preview</h2>
          <p className="text-sm text-muted-foreground mb-4">
            How it looks on a mobile device (fixed at bottom)
          </p>
        </div>
        <div className="relative bg-muted rounded-2xl p-4" style={{ height: '600px' }}>
          {/* Phone mockup */}
          <div className="w-full max-w-[375px] mx-auto h-full bg-background rounded-xl shadow-2xl border-8 border-zinc-800 flex flex-col overflow-hidden">
            {/* Status bar */}
            <div className="h-6 bg-card border-b flex items-center justify-between px-4">
              <span className="text-xs">9:41</span>
              <span className="text-xs">● ● ●</span>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">Gym Tracker</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your workout companion
              </p>
              <div className="space-y-3">
                <div className="h-20 bg-card rounded-lg border"></div>
                <div className="h-20 bg-card rounded-lg border"></div>
                <div className="h-20 bg-card rounded-lg border"></div>
              </div>
            </div>

            {/* Fixed bottom navigation */}
            <div className="p-3 bg-background border-t">
              <InteractiveMenu items={gymTrackerMenuItems} accentColor={customAccentColor} />
            </div>
          </div>
        </div>
      </div>

      {/* Usage instructions */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">How to Use</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold mb-1">1. Import the component</h3>
              <code className="block bg-muted p-2 rounded text-xs">
                {`import { InteractiveMenu } from "@/components/ui/modern-mobile-menu";`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-1">2. Define your menu items</h3>
              <code className="block bg-muted p-2 rounded text-xs whitespace-pre">
{`const menuItems = [
  { label: 'home', icon: Home },
  { label: 'workout', icon: Dumbbell },
  { label: 'analytics', icon: BarChart3 },
];`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-1">3. Use in your layout</h3>
              <code className="block bg-muted p-2 rounded text-xs">
                {`<InteractiveMenu items={menuItems} accentColor="hsl(var(--chart-2))" />`}
              </code>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Props</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>items</strong> (optional): Array of menu items (2-5 items)</li>
              <li><strong>accentColor</strong> (optional): CSS color for active state</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

