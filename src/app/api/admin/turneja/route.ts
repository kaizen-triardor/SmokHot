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

// GET /api/admin/turneja - List all tour events
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.tourEvent.findMany({
      orderBy: { date: 'desc' }
    })

    const transformed = events.map(event => ({
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
    }))

    return NextResponse.json(transformed)

  } catch (error) {
    console.error('Tour events GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/turneja - Create new tour event
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const event = await prisma.tourEvent.create({
      data: {
        title: body.title,
        location: body.location,
        date: new Date(body.date),
        time: body.time || '',
        status: body.status || 'upcoming',
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
    console.error('Tour events POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
