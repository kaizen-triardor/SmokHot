import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'smokin-hot-secret-key-change-in-production'

function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

// Helper to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// GET /api/admin/products - List products with pagination
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('_start') || '0')
    const limit = parseInt(searchParams.get('_end') || '10') - page
    const sortField = searchParams.get('_sort') || 'createdAt'
    const sortOrder = searchParams.get('_order') || 'DESC'

    const products = await prisma.product.findMany({
      skip: page,
      take: limit,
      orderBy: {
        [sortField]: sortOrder.toLowerCase()
      }
    })

    const total = await prisma.product.count()

    // Transform for React Admin
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      blurb: product.blurb,
      heatLevel: product.heatLevel,
      heatNumber: product.heatNumber,
      price: product.price / 100, // Convert from cents to RSD
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
      volume: product.volume,
      scoville: product.scoville,
      inStock: product.inStock,
      stockCount: product.stockCount,
      featured: product.featured,
      ingredients: product.ingredients ? JSON.parse(product.ingredients) : [],
      pairings: product.pairings ? JSON.parse(product.pairings) : [],
      categories: product.categories ? JSON.parse(product.categories) : [],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }))

    const response = NextResponse.json(transformedProducts)
    response.headers.set('X-Total-Count', total.toString())
    return response

  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || '',
        blurb: body.blurb || '',
        heatLevel: body.heatLevel,
        heatNumber: body.heatNumber,
        price: Math.round(body.price * 100), // Convert to cents
        originalPrice: body.originalPrice ? Math.round(body.originalPrice * 100) : null,
        volume: body.volume || '150ml',
        scoville: body.scoville,
        inStock: body.inStock ?? true,
        stockCount: body.stockCount || 0,
        featured: body.featured ?? false,
        ingredients: body.ingredients ? JSON.stringify(body.ingredients) : null,
        pairings: body.pairings ? JSON.stringify(body.pairings) : null,
        categories: body.categories ? JSON.stringify(body.categories) : null
      }
    })

    return NextResponse.json({
      id: product.id,
      ...body,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}