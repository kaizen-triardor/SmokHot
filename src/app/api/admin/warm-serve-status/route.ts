import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { getSnapshotMeta, type SnapshotKey } from '@/lib/snapshot'

/**
 * GET /api/admin/warm-serve-status
 * Cron + snapshot health for the admin dashboard widget.
 */
export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

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
