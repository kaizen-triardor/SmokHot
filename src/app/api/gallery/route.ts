import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/gallery - Public: list gallery images with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category ? { category } : {}

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    const transformed = images.map((image) => ({
      id: image.id,
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      category: image.category,
      featured: image.featured,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Public gallery GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
