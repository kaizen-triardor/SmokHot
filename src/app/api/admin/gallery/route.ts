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
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(images)
  } catch (error) {
    return handlePrismaError(error, 'Galerija')
  }
}

export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    requireField(body.title, 'title')
    requireField(body.imageUrl, 'imageUrl')

    const image = await prisma.galleryImage.create({
      data: {
        title: body.title,
        description: body.description || null,
        imageUrl: body.imageUrl,
        category: body.category || 'general',
        featured: body.featured ?? false,
        sortOrder: Number(body.sortOrder) || 0,
      },
    })

    refreshSnapshotAsync('gallery')
    await logAudit(request, adminOrResp, {
      action: 'CREATE',
      resource: 'gallery',
      resourceId: image.id,
      summary: `Dodata slika: ${image.title}`,
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    return handlePrismaError(error, 'Slika')
  }
}
