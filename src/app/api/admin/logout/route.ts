import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie, getAdminFromRequest } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit-log'

/**
 * POST /api/admin/logout
 *
 * Clears the admin session cookie. Records an audit entry if the admin
 * was identifiable, so the logout shows up in /admin/audit-log.
 */
export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (admin) {
    await logAudit(request, admin, {
      action: 'LOGOUT',
      resource: 'admin',
      resourceId: admin.id,
      summary: 'Odjava',
    })
  }

  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', clearAdminCookie())
  return res
}
