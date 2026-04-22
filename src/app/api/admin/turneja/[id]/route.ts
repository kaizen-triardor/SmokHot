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

// GET /api/admin/turneja/[id] - Get single tour event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.tourEvent.findUnique({
      where: { id: params.id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: event.id,
      title: event.title,
      location: event.location,
      date: event.date.toISOString(),
      time: event.time,
      status: event.status,
      highlight: event.highlight,
      description: event.description,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Tour event GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/turneja/[id] - Update tour event
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

    const event = await prisma.tourEvent.update({
      where: { id: params.id },
      data: {
        title: body.title,
        location: body.location,
        date: new Date(body.date),
        time: body.time,
        status: body.status,
        highlight: body.highlight || null,
        description: body.description || null
      }
    })

    return NextResponse.json({
      id: event.id,
      title: event.title,
      location: event.location,
      date: event.date.toISOString(),
      time: event.time,
      status: event.status,
      highlight: event.highlight,
      description: event.description,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Tour event PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/turneja/[id] - Delete tour event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.tourEvent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Event deleted' })

  } catch (error) {
    console.error('Tour event DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
