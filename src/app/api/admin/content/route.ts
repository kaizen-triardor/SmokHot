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

// GET /api/admin/content - List all content entries
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const content = await prisma.content.findMany({
      orderBy: [{ section: 'asc' }, { key: 'asc' }]
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Admin content GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/content - Update content by key
export async function PUT(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, content, title } = body

    if (!key || content === undefined) {
      return NextResponse.json({ error: 'Key and content are required' }, { status: 400 })
    }

    const updateData: { content: string; title?: string } = { content }
    if (title !== undefined) {
      updateData.title = title
    }

    const updated = await prisma.content.update({
      where: { key },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Admin content PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/content - Create new content entry
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, title, content, type, section } = body

    if (!key || !title || content === undefined || !type || !section) {
      return NextResponse.json(
        { error: 'key, title, content, type, and section are required' },
        { status: 400 }
      )
    }

    const created = await prisma.content.create({
      data: { key, title, content, type, section }
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Admin content POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
