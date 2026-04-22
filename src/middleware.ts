import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

/**
 * Server-side admin gate.
 *
 * Runs at the edge on every request whose path matches `matcher`. If the
 * admin session cookie is missing, we either:
 *  - redirect HTML navigations to `/admin` (login)
 *  - return 401 for API routes
 *
 * NOTE: this middleware performs *presence* check only, not JWT verify,
 * because `jwt.verify` needs Node APIs that aren't available in the
 * Edge runtime. Full JWT verification still runs inside each API route
 * via `requireAdmin()`. The middleware's job is to keep unauthenticated
 * users out of the admin pages entirely so they don't even hit client
 * code. Defense in depth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth endpoints and the login page itself
  if (pathname === '/admin' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (!cookie) {
    // HTML navigation → redirect to login
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/admin', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // API → 401
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
