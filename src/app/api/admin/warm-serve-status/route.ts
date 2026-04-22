import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getSnapshotMeta, type SnapshotKey } from '@/lib/snapshot'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || ''

async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    jwt.verify(authHeader.substring(7), JWT_SECRET)
    return true
  } catch {
    return false
  }
}

/**
 * GET /api/admin/warm-serve-status
 * Returns cron + snapshot health for the admin dashboard widget.
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Last health ping (persisted by /api/health when called by cron)
  let lastPing: string | null = null
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'last_health_ping' } })
    lastPing = row?.value ?? null
  } catch {
    /* DB may be cold */
  }

  const keys: SnapshotKey[] = ['products', 'blog', 'gallery', 'turneja', 'settings']
  const snapshots: Record<string, Awaited<ReturnType<typeof getSnapshotMeta>>> = {}
  for (const k of keys) snapshots[k] = await getSnapshotMeta(k)

  return NextResponse.json({
    lastHealthPing: lastPing,
    lastHealthPingAgeMs: lastPing ? Date.now() - new Date(lastPing).getTime() : null,
    snapshots,
    now: new Date().toISOString(),
  })
}
