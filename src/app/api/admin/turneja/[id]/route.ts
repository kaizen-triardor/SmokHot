import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAdminRole } from '@/lib/admin-auth'
import { handlePrismaError } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { logAudit } from '@/lib/audit-log'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const event = await prisma.tourEvent.findUnique({ where: { id: params.id } })
    if (!event) {
      return NextResponse.json({ error: 'Događaj nije pronađen.' }, { status: 404 })
    }
    return NextResponse.json({
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })
  } catch (error) {
    return handlePrismaError(error, 'Događaj')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.location !== undefined) data.location = body.location
    if (body.date !== undefined) {
      const d = new Date(body.date)
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Neispravan datum.' }, { status: 400 })
      }
      data.date = d
    }
    if (body.time !== undefined) data.time = body.time
    if (body.status !== undefined) data.status = body.status
    if (body.highlight !== undefined) data.highlight = body.highlight || null
    if (body.description !== undefined) data.description = body.description || null

    const event = await prisma.tourEvent.update({ where: { id: params.id }, data })
    refreshSnapshotAsync('turneja')
    await logAudit(request, adminOrResp, {
      action: 'UPDATE',
      resource: 'turneja',
      resourceId: event.id,
      summary: `Ažuriran događaj: ${event.title}`,
      metadata: { changedFields: Object.keys(data) },
    })
    return NextResponse.json({
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })
  } catch (error) {
    return handlePrismaError(error, 'Događaj')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdminRole(request, ['super_admin'])
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const existing = await prisma.tourEvent.findUnique({ where: { id: params.id } })
    await prisma.tourEvent.delete({ where: { id: params.id } })
    refreshSnapshotAsync('turneja')
    await logAudit(request, adminOrResp, {
      action: 'DELETE',
      resource: 'turneja',
      resourceId: params.id,
      summary: `Obrisan događaj: ${existing?.title ?? params.id}`,
    })
    return NextResponse.json({ message: 'Obrisano.' })
  } catch (error) {
    return handlePrismaError(error, 'Događaj')
  }
}
