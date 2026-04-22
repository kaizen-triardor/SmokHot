import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'

function transform(image: any) {
  return {
    id: image.id,
    title: image.title,
    description: image.description,
    imageUrl: image.imageUrl,
    category: image.category,
    featured: image.featured,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt?.toISOString?.() ?? image.createdAt,
    updatedAt: image.updatedAt?.toISOString?.() ?? image.updatedAt,
  }
}

export type PublicGalleryImage = ReturnType<typeof transform>

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const result = await withTimeoutFallback(
      async () => {
        const where = category ? { category } : {}
        const images = await prisma.galleryImage.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        })
        return images.map(transform)
      },
      async () => {
        const all = await getSnapshot<PublicGalleryImage[]>('gallery')
        if (!all) return null
        return category ? all.filter((i) => i.category === category) : all
      },
    )

    // Only persist the unfiltered snapshot (the full list). Filtered views are
    // derived from it.
    if (result.source === 'live' && !category) {
      void saveSnapshot('gallery', result.data)
    }

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Public gallery GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
