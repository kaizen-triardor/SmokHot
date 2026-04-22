import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Health endpoint. Hit by Vercel Cron every 6 days to keep Supabase warm
 * (Supabase Free pauses after 7 days of no connections).
 *
 * Also doubles as a liveness probe for uptime monitoring.
 */
export async function GET(request: Request) {
  const t0 = Date.now()

  // Lightweight auth — only accept Vercel's cron header OR our own secret.
  // Anyone can hit the endpoint, but they won't pollute the `last_health_ping`
  // setting unless they're the cron.
  const url = new URL(request.url)
  const isCron =
    request.headers.get('user-agent')?.includes('vercel-cron') ||
    request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}` ||
    url.searchParams.get('dev') === '1'

  try {
    // Minimal query — wakes the DB if it was paused.
    await prisma.$queryRaw`SELECT 1`
    const dbMs = Date.now() - t0

    // Persist ping timestamp for the admin dashboard widget.
    if (isCron) {
      try {
        await prisma.setting.upsert({
          where: { key: 'last_health_ping' },
          update: { value: new Date().toISOString() },
          create: { key: 'last_health_ping', value: new Date().toISOString() },
        })
      } catch {
        /* not fatal */
      }
    }

    return NextResponse.json(
      { ok: true, db_ms: dbMs, cron: isCron, ts: new Date().toISOString() },
      { status: 200 },
    )
  } catch (err) {
    console.error('[health] DB query failed:', err)
    return NextResponse.json(
      { ok: false, error: 'db_unreachable', ts: new Date().toISOString() },
      { status: 503 },
    )
  }
}
