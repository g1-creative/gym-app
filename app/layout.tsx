import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/navigation/Nav'
import BottomNavBar from '@/components/ui/bottom-nav-bar'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gymville - Progressive Overload Tracker',
  description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals with Gymville',
  applicationName: 'Gymville',
  manifest: '/manifest.json',
  icons: {
    icon: '/gymville-logo.png',
    apple: '/gymville-logo.png',
    shortcut: '/gymville-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gymville',
    startupImage: '/gymville-logo.png',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gymville',
    title: 'Gymville - Progressive Overload Tracker',
    description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals',
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
        <link rel="icon" href="/gymville-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/gymville-logo.png" />
        <link rel="shortcut icon" href="/gymville-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gymville" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Gymville" />
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

          {/* PWA Install Prompt */}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}

