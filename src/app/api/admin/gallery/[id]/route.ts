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

// GET /api/admin/gallery/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const image = await prisma.galleryImage.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json(image)

  } catch (error) {
    console.error('Gallery GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/gallery/[id]
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

    const image = await prisma.galleryImage.update({
      where: { id: params.id },
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
    console.error('Gallery PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/gallery/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.galleryImage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Image deleted' })

  } catch (error) {
    console.error('Gallery DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
