import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  const { searchParams } = new URL(request.url)
  const resource = searchParams.get('resource')
  const action = searchParams.get('action')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500)

  const where: Record<string, unknown> = {}
  if (resource) where.resource = resource
  if (action) where.action = action

  try {
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error('[audit-log] GET error:', err)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
