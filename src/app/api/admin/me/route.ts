import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/me
 *
 * Returns the authenticated admin based on the session cookie (or Bearer
 * during migration). Used by the admin layout to check auth on mount,
 * replacing the old pattern of pinging /api/admin/dashboard.
 */
export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminOrResp.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
      },
    })
    if (!admin || !admin.active) {
      return NextResponse.json({ error: 'Nalog je deaktiviran.' }, { status: 401 })
    }
    return NextResponse.json(admin)
  } catch (err) {
    console.error('[me] error:', err)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
