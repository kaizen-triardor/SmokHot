import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/turneja - Public: list all tour events
export async function GET() {
  try {
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
    console.error('Public tour events GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
