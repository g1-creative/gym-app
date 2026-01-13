import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/navigation/Nav'
import BottomNavBar from '@/components/ui/bottom-nav-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gym Tracker - Progressive Overload Tracker',
  description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gym Tracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:block">
            <Nav />
          </div>
          
          {/* Main content with bottom padding on mobile for nav bar */}
          <div className="pb-20 md:pb-0">
            {children}
          </div>
          
          {/* Mobile bottom navigation - hidden on desktop */}
          <div className="md:hidden">
            <BottomNavBar stickyBottom />
          </div>
        </Providers>
      </body>
    </html>
  )
}

