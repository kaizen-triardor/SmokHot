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
    const image = await prisma.galleryImage.findUnique({ where: { id: params.id } })
    if (!image) {
      return NextResponse.json({ error: 'Slika nije pronađena.' }, { status: 404 })
    }
    return NextResponse.json(image)
  } catch (error) {
    return handlePrismaError(error, 'Slika')
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
    if (body.description !== undefined) data.description = body.description || null
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
    if (body.category !== undefined) data.category = body.category || 'general'
    if (body.featured !== undefined) data.featured = body.featured
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0

    const image = await prisma.galleryImage.update({ where: { id: params.id }, data })
    refreshSnapshotAsync('gallery')
    await logAudit(request, adminOrResp, {
      action: 'UPDATE',
      resource: 'gallery',
      resourceId: image.id,
      summary: `Ažurirana slika: ${image.title}`,
      metadata: { changedFields: Object.keys(data) },
    })
    return NextResponse.json(image)
  } catch (error) {
    return handlePrismaError(error, 'Slika')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdminRole(request, ['super_admin'])
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const existing = await prisma.galleryImage.findUnique({ where: { id: params.id } })
    await prisma.galleryImage.delete({ where: { id: params.id } })
    refreshSnapshotAsync('gallery')
    await logAudit(request, adminOrResp, {
      action: 'DELETE',
      resource: 'gallery',
      resourceId: params.id,
      summary: `Obrisana slika: ${existing?.title ?? params.id}`,
    })
    return NextResponse.json({ message: 'Obrisano.' })
  } catch (error) {
    return handlePrismaError(error, 'Slika')
  }
}
