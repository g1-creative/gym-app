'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Don't show nav on login page
  if (pathname === '/login' || !isAuthenticated) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/programs', label: 'Programs' },
    { href: '/history', label: 'History' },
    { href: '/analytics', label: 'Analytics' },
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-slate-300 text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}

