import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'
import type { PublicProduct } from '../route'

function transform(product: any) {
  return {
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
    galleryImages: product.galleryImages ? JSON.parse(product.galleryImages) : [],
    thumbnail: product.thumbnail,
    ingredients: product.ingredients ? JSON.parse(product.ingredients) : [],
    volume: product.volume,
    scoville: product.scoville,
    pairings: product.pairings ? JSON.parse(product.pairings) : [],
    inStock: product.inStock,
    stockCount: product.stockCount,
    featured: product.featured,
    categories: product.categories ? JSON.parse(product.categories) : [],
    calories: product.calories,
    fat: product.fat,
    carbs: product.carbs,
    protein: product.protein,
    sodium: product.sodium,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
  }
}

// GET /api/products/[slug] — warm-serve wrapped
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    const result = await withTimeoutFallback(
      async () => {
        const product = await prisma.product.findUnique({ where: { slug } })
        if (!product || product.deletedAt) return null
        return transform(product)
      },
      async () => {
        // Fallback — look up the slug inside the cached products list snapshot.
        const list = await getSnapshot<PublicProduct[]>('products')
        if (!list) return null
        return list.find((p) => p.slug === slug) ?? null
      },
    )

    if (result.data === null) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Public product GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
