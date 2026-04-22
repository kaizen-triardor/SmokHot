import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError, requireField } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { logAudit } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const events = await prisma.tourEvent.findMany({ orderBy: { date: 'desc' } })
    const transformed = events.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      date: e.date.toISOString(),
      time: e.time,
      status: e.status,
      highlight: e.highlight,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))
    return NextResponse.json(transformed)
  } catch (error) {
    return handlePrismaError(error, 'Turneja')
  }
}

export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const title = requireField(body.title, 'title') as string
    const location = requireField(body.location, 'location') as string
    const dateRaw = requireField(body.date, 'date') as string
    const date = new Date(dateRaw)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Neispravan datum.' }, { status: 400 })
    }

    const event = await prisma.tourEvent.create({
      data: {
        title,
        location,
        date,
        time: body.time || '',
        status: body.status || 'upcoming',
        highlight: body.highlight || null,
        description: body.description || null,
      },
    })

    refreshSnapshotAsync('turneja')
    await logAudit(request, adminOrResp, {
      action: 'CREATE',
      resource: 'turneja',
      resourceId: event.id,
      summary: `Dodat događaj: ${event.title}`,
    })

    return NextResponse.json(
      {
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date.toISOString(),
        time: event.time,
        status: event.status,
        highlight: event.highlight,
        description: event.description,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    return handlePrismaError(error, 'Događaj')
  }
}
