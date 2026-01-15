import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ConditionalNav } from '@/components/layout/ConditionalNav'
import { ConditionalWrapper } from '@/components/layout/ConditionalWrapper'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { ServiceWorkerUpdate } from '@/components/pwa/ServiceWorkerUpdate'
import { LoadingScreen } from '@/components/LoadingScreen'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Gymville - Progressive Overload Tracker',
    template: '%s | Gymville',
  },
  description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals with Gymville. A modern PWA for serious lifters.',
  applicationName: 'Gymville',
  authors: [{ name: 'Gymville' }],
  keywords: ['fitness', 'workout tracker', 'progressive overload', 'gym', 'strength training', 'weightlifting', 'pwa', 'fitness app'],
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
    description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals with Gymville',
    url: 'https://your-domain.com',
    images: [
      {
        url: '/gymville-logo.png',
        width: 1200,
        height: 630,
        alt: 'Gymville - Progressive Overload Tracker',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gymville - Progressive Overload Tracker',
    description: 'Track your workouts, monitor progressive overload, and achieve your fitness goals',
    images: ['/gymville-logo.png'],
    creator: '@gymville',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'fitness',
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
          {/* Navigation - hidden on auth pages */}
          <ConditionalNav />
          
          {/* Main content with conditional padding for bottom nav */}
          <ConditionalWrapper>
            {children}
          </ConditionalWrapper>

          {/* PWA Install Prompt */}
          <InstallPrompt />
          
          {/* Service Worker Update Notification */}
          <ServiceWorkerUpdate />
          
          {/* Loading Screen */}
          <LoadingScreen />
        </Providers>
      </body>
    </html>
  )
}

