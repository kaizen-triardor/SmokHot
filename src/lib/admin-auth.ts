/**
 * admin-auth.ts — single source of truth for admin-route auth.
 *
 * Replaces the 12 inline copies of verifyToken/verifyAdminAccess that were
 * scattered across `/api/admin/*` routes. Every admin API route should call
 * `requireAdmin(request)` at the top; on failure it returns a 401 response
 * the caller should return immediately.
 *
 * Cookie-first: in Tier C we migrate JWT from localStorage to an httpOnly
 * cookie. For backward compatibility during the rollout, the header-based
 * path (Authorization: Bearer …) is kept as a fallback.
 */
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AdminTokenPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export const ADMIN_COOKIE_NAME = 'admin-session'

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET
  if (!s || s.length < 16) {
    // Fail loud in prod; in dev we still boot so hot-reload works
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET is missing or too short (min 16 chars)')
    }
    return s || ''
  }
  return s
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, getSecret()) as AdminTokenPayload
    if (!payload?.id || !payload?.email) return null
    return payload
  } catch {
    return null
  }
}

function extractToken(request: NextRequest | Request): string | null {
  // 1. Cookie (preferred, once Tier C migration is live)
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`))
    if (match) return decodeURIComponent(match[1])
  }
  // 2. Authorization: Bearer (legacy path)
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

/**
 * Pull the authenticated admin from the request or return null.
 * Non-throwing — intended for endpoints that conditionally enrich.
 */
export function getAdminFromRequest(request: NextRequest | Request): AdminTokenPayload | null {
  const token = extractToken(request)
  if (!token) return null
  return verifyAdminToken(token)
}

/**
 * Require an authenticated admin. Returns either the admin payload OR a
 * 401 response. Caller must check `if ('status' in result) return result;`.
 */
export function requireAdmin(
  request: NextRequest | Request,
): AdminTokenPayload | NextResponse {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return admin
}

/**
 * Optional: require a specific role. Super-admin-only routes use this.
 */
export function requireAdminRole(
  request: NextRequest | Request,
  allowedRoles: string[],
): AdminTokenPayload | NextResponse {
  const result = requireAdmin(request)
  if (result instanceof NextResponse) return result
  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return result
}

/** Issue a JWT for a freshly-authenticated admin. */
export function signAdminToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>, expiresIn = '24h'): string {
  return jwt.sign(payload, getSecret(), { expiresIn: expiresIn as any })
}

/** Helper for `Set-Cookie` header when we flip to cookie-based auth in Tier C. */
export function buildAdminCookie(token: string, maxAgeSeconds = 86400): string {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
}
