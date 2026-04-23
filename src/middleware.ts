import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { routing } from '@/i18n/routing'

/**
 * Combined edge middleware:
 *  - /admin/* and /api/admin/* → presence-check session cookie (admin gate)
 *  - everything else (public site) → next-intl locale detection + routing
 *
 * Admin middleware keeps unauthenticated users from even hitting the admin
 * shell; full JWT verify still happens in each API route. Defense in depth.
 *
 * next-intl handles Accept-Language sniffing on first visit, NEXT_LOCALE
 * cookie after user chooses, and prefixes URLs for non-default locales.
 */
const intlMiddleware = createMiddleware(routing)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin gate
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow auth endpoints and the login page itself
    if (pathname === '/admin' || pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next()
    }

    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!cookie) {
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/admin', request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Everything else is the public site — run locale routing.
  return intlMiddleware(request)
}

export const config = {
  // Match all routes except Next.js internals, static assets, and public API
  // (public API doesn't need locale prefixes — API consumers send Accept-Language
  // or the locale in the payload).
  matcher: [
    '/((?!_next|_vercel|api/|.*\\..*).*)',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
