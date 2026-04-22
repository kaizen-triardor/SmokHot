import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError, requireField } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { slugify } from '@/lib/slugify'
import { logAudit } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('_start') || '0')
    const limit = parseInt(searchParams.get('_end') || '100') - page
    const allowedSortFields = ['createdAt', 'name', 'price', 'heatNumber', 'stockCount', 'updatedAt']
    const rawSortField = searchParams.get('_sort') || 'createdAt'
    const sortField = allowedSortFields.includes(rawSortField) ? rawSortField : 'createdAt'
    const sortOrder = searchParams.get('_order') === 'ASC' ? 'asc' : 'desc'

    const products = await prisma.product.findMany({
      skip: page,
      take: Math.max(1, limit),
      orderBy: { [sortField]: sortOrder },
    })
    const total = await prisma.product.count()

    const transformed = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      blurb: p.blurb,
      heatLevel: p.heatLevel,
      heatNumber: p.heatNumber,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      mainImage: p.mainImage,
      thumbnail: p.thumbnail,
      galleryImages: p.galleryImages ? JSON.parse(p.galleryImages) : [],
      volume: p.volume,
      scoville: p.scoville,
      inStock: p.inStock,
      stockCount: p.stockCount,
      featured: p.featured,
      ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
      pairings: p.pairings ? JSON.parse(p.pairings) : [],
      categories: p.categories ? JSON.parse(p.categories) : [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    const response = NextResponse.json(transformed)
    response.headers.set('X-Total-Count', total.toString())
    return response
  } catch (error) {
    return handlePrismaError(error, 'Proizvodi')
  }
}

export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const name = requireField(body.name, 'name') as string
    const heatNumber = Number(body.heatNumber)
    if (!Number.isFinite(heatNumber) || heatNumber < 1 || heatNumber > 6) {
      return NextResponse.json({ error: 'Ljutina (heatNumber) mora biti 1–6.' }, { status: 400 })
    }
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Cena mora biti nenegativan broj.' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: body.slug ? slugify(body.slug) : slugify(name),
        description: body.description || '',
        blurb: body.blurb || '',
        heatLevel: body.heatLevel || 'mild',
        heatNumber,
        price: Math.round(price),
        originalPrice: body.originalPrice != null ? Math.round(Number(body.originalPrice)) : null,
        mainImage: body.mainImage || null,
        volume: body.volume || '106ml',
        scoville: body.scoville ?? null,
        inStock: body.inStock ?? true,
        stockCount: Number(body.stockCount) || 0,
        featured: body.featured ?? false,
        ingredients: body.ingredients ? JSON.stringify(body.ingredients) : null,
        pairings: body.pairings ? JSON.stringify(body.pairings) : null,
        categories: body.categories ? JSON.stringify(body.categories) : null,
      },
    })

    refreshSnapshotAsync('products')
    await logAudit(request, adminOrResp, {
      action: 'CREATE',
      resource: 'product',
      resourceId: product.id,
      summary: `Kreiran proizvod: ${product.name}`,
    })

    return NextResponse.json(
      {
        id: product.id,
        ...body,
        slug: product.slug,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    return handlePrismaError(error, 'Proizvod')
  }
}
