import BottomNavBar from '@/components/ui/bottom-nav-bar'

export default function BottomNavDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Bottom Navigation Bar Demo</h1>
          <p className="text-muted-foreground">
            A modern, animated bottom navigation component with smooth transitions
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Default (Non-sticky)</h2>
            <div className="flex justify-center">
              <BottomNavBar />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Sticky Bottom</h2>
            <p className="text-muted-foreground">
              Scroll down to see the sticky bottom navigation in action
            </p>
            <div className="h-[500px] bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Scroll area - The nav bar sticks to the bottom</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Navigation</h2>
            <p className="text-muted-foreground">
              The active item is automatically highlighted based on the current route. Click any item to navigate!
            </p>
            <div className="flex justify-center">
              <BottomNavBar />
            </div>
          </section>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Component Features:</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Smooth framer-motion animations</li>
            <li>Active state with label expansion</li>
            <li>Dark mode support</li>
            <li>Sticky bottom positioning option</li>
            <li>Fully accessible with ARIA labels</li>
            <li>Responsive design</li>
            <li>Touch-optimized tap targets</li>
            <li>Integrated with Next.js routing</li>
            <li>Automatic active route detection</li>
          </ul>
        </div>
      </div>

      {/* Sticky Bottom Nav */}
      <BottomNavBar stickyBottom />
    </div>
  )
}

