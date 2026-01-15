'use client'

import { usePathname } from 'next/navigation'
import { Nav } from '@/components/navigation/Nav'
import BottomNavBar from '@/components/ui/bottom-nav-bar'

export function ConditionalNav() {
  const pathname = usePathname()
  
  // Hide navigation on auth pages
  const hideNav = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth')
  
  if (hideNav) {
    return null
  }
  
  return (
    <>
      {/* Desktop navigation - hidden on mobile */}
      <div className="hidden md:block">
        <Nav />
      </div>
      
      {/* Mobile bottom navigation - hidden on desktop */}
      <div className="md:hidden">
        <BottomNavBar stickyBottom />
      </div>
    </>
  )
}
