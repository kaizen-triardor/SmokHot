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

// GET /api/admin/gallery - List gallery images
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category && category !== 'all' ? { category } : {}

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const total = await prisma.galleryImage.count({ where })

    const response = NextResponse.json(images)
    response.headers.set('X-Total-Count', total.toString())
    return response

  } catch (error) {
    console.error('Gallery GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/gallery - Create gallery image
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const image = await prisma.galleryImage.create({
      data: {
        title: body.title,
        description: body.description || null,
        imageUrl: body.imageUrl,
        category: body.category || 'general',
        featured: body.featured ?? false,
        sortOrder: body.sortOrder ?? 0,
      }
    })

    return NextResponse.json(image)

  } catch (error) {
    console.error('Gallery POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
