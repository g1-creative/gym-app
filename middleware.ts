import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth routes (login, signup, auth callback)
     * - public folder files (images, manifest, service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|login|signup|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
