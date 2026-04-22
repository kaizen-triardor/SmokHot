import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || ''

function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      blurb: product.blurb,
      heatLevel: product.heatLevel,
      heatNumber: product.heatNumber,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
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
    }

    return NextResponse.json(transformedProduct)

  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const updateData: any = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      blurb: body.blurb,
      heatLevel: body.heatLevel,
      heatNumber: body.heatNumber,
      price: Math.round(body.price),
      mainImage: body.mainImage || null,
      volume: body.volume,
      scoville: body.scoville,
      inStock: body.inStock,
      stockCount: body.stockCount,
      featured: body.featured,
    }

    // Handle optional fields
    if (body.originalPrice !== undefined) {
      updateData.originalPrice = body.originalPrice ? Math.round(body.originalPrice) : null
    }
    
    if (body.ingredients !== undefined) {
      updateData.ingredients = Array.isArray(body.ingredients) ? JSON.stringify(body.ingredients) : body.ingredients
    }
    
    if (body.pairings !== undefined) {
      updateData.pairings = Array.isArray(body.pairings) ? JSON.stringify(body.pairings) : body.pairings
    }
    
    if (body.categories !== undefined) {
      updateData.categories = Array.isArray(body.categories) ? JSON.stringify(body.categories) : body.categories
    }
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      id: product.id,
      ...body,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      updatedAt: product.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Product deleted' })

  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}