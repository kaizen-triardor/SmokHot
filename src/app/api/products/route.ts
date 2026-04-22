import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - Public: list all in-stock products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { heatNumber: 'asc' },
    })

    const transformed = products.map((product) => ({
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
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Public products GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
