import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAdminRole } from '@/lib/admin-auth'
import { handlePrismaError } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { slugify } from '@/lib/slugify'
import { logAudit } from '@/lib/audit-log'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 })
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      blurb: product.blurb,
      heatLevel: product.heatLevel,
      heatNumber: product.heatNumber,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      mainImage: product.mainImage,
      thumbnail: product.thumbnail,
      galleryImages: product.galleryImages ? JSON.parse(product.galleryImages) : [],
      volume: product.volume,
      scoville: product.scoville,
      inStock: product.inStock,
      stockCount: product.stockCount,
      featured: product.featured,
      ingredients: product.ingredients ? JSON.parse(product.ingredients) : [],
      pairings: product.pairings ? JSON.parse(product.pairings) : [],
      categories: product.categories ? JSON.parse(product.categories) : [],
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoOgImage: product.seoOgImage,
      calories: product.calories,
      fat: product.fat,
      carbs: product.carbs,
      protein: product.protein,
      sodium: product.sodium,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })
  } catch (error) {
    return handlePrismaError(error, 'Proizvod')
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
    // Partial update — only set fields that were actually sent
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = slugify(body.slug)
    if (body.description !== undefined) data.description = body.description
    if (body.blurb !== undefined) data.blurb = body.blurb
    if (body.heatLevel !== undefined) data.heatLevel = body.heatLevel
    if (body.heatNumber !== undefined) data.heatNumber = Number(body.heatNumber)
    if (body.price !== undefined) data.price = Math.round(Number(body.price))
    if (body.originalPrice !== undefined) {
      data.originalPrice = body.originalPrice ? Math.round(Number(body.originalPrice)) : null
    }
    if (body.mainImage !== undefined) data.mainImage = body.mainImage || null
    if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail || null
    if (body.volume !== undefined) data.volume = body.volume
    if (body.scoville !== undefined) data.scoville = body.scoville
    if (body.inStock !== undefined) data.inStock = body.inStock
    if (body.stockCount !== undefined) data.stockCount = Number(body.stockCount) || 0
    if (body.featured !== undefined) data.featured = body.featured
    if (body.ingredients !== undefined) {
      data.ingredients = Array.isArray(body.ingredients)
        ? JSON.stringify(body.ingredients)
        : body.ingredients
    }
    if (body.pairings !== undefined) {
      data.pairings = Array.isArray(body.pairings) ? JSON.stringify(body.pairings) : body.pairings
    }
    if (body.categories !== undefined) {
      data.categories = Array.isArray(body.categories) ? JSON.stringify(body.categories) : body.categories
    }
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null
    if (body.seoOgImage !== undefined) data.seoOgImage = body.seoOgImage || null

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    })

    refreshSnapshotAsync('products')
    await logAudit(request, adminOrResp, {
      action: 'UPDATE',
      resource: 'product',
      resourceId: product.id,
      summary: `Ažuriran proizvod: ${product.name}`,
      metadata: { changedFields: Object.keys(data) },
    })

    return NextResponse.json({
      id: product.id,
      ...body,
      mainImage: product.mainImage,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      updatedAt: product.updatedAt.toISOString(),
    })
  } catch (error) {
    return handlePrismaError(error, 'Proizvod')
  }
}

/**
 * DELETE — soft-delete by default (sets `deletedAt` + hides from public shop).
 * `?purge=1` performs a hard delete (super_admin only).
 *
 * Soft delete keeps historical order integrity — past orders can still
 * reference the product by name and price via their JSON items blob.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdminRole(request, ['super_admin'])
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const { searchParams } = new URL(request.url)
    const purge = searchParams.get('purge') === '1'
    const existing = await prisma.product.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 })
    }

    if (purge) {
      await prisma.product.delete({ where: { id: params.id } })
    } else {
      await prisma.product.update({
        where: { id: params.id },
        data: { deletedAt: new Date(), inStock: false },
      })
    }

    refreshSnapshotAsync('products')
    await logAudit(request, adminOrResp, {
      action: 'DELETE',
      resource: 'product',
      resourceId: params.id,
      summary: `${purge ? 'Trajno obrisan' : 'Obrisan (soft)'} proizvod: ${existing.name}`,
    })
    return NextResponse.json({
      message: purge ? 'Trajno obrisano.' : 'Obrisano (može se povratiti).',
      purged: purge,
    })
  } catch (error) {
    return handlePrismaError(error, 'Proizvod')
  }
}

/**
 * POST /api/admin/products/[id]/restore — undo a soft delete.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('action') !== 'restore') {
      return NextResponse.json({ error: 'Nepoznata akcija.' }, { status: 400 })
    }
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: null },
    })
    refreshSnapshotAsync('products')
    await logAudit(request, adminOrResp, {
      action: 'RESTORE',
      resource: 'product',
      resourceId: product.id,
      summary: `Povraćen proizvod: ${product.name}`,
    })
    return NextResponse.json({ message: 'Povraćeno.', product })
  } catch (error) {
    return handlePrismaError(error, 'Proizvod')
  }
}
