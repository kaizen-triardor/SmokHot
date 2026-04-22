import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'

export type PublicProduct = ReturnType<typeof transform>

function transform(product: Awaited<ReturnType<typeof prisma.product.findFirst>> & object) {
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
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

// GET /api/products — warm-serve wrapped
export async function GET() {
  try {
    const result = await withTimeoutFallback(
      async () => {
        const products = await prisma.product.findMany({
          where: { deletedAt: null },
          orderBy: { heatNumber: 'asc' },
        })
        return products.map(transform)
      },
      () => getSnapshot<PublicProduct[]>('products'),
    )

    // Fire-and-forget: refresh snapshot when live data came through.
    if (result.source === 'live') {
      void saveSnapshot('products', result.data)
    }

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        // ISR hint for Vercel + CDN caches
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Public products GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
