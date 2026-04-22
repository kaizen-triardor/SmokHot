import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

/** GET /api/admin/profile — returns the current admin's record (no password). */
export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const record = await prisma.admin.findUnique({
      where: { id: adminOrResp.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        createdAt: true,
      },
    })
    if (!record) {
      return NextResponse.json({ error: 'Admin nije pronađen.' }, { status: 404 })
    }
    return NextResponse.json(record)
  } catch (err) {
    console.error('Profile GET error:', err)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
