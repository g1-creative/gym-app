'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function ConditionalWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Don't add padding on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth')
  
  return (
    <div className={isAuthPage ? '' : 'pb-20 md:pb-0'}>
      {children}
    </div>
  )
}
