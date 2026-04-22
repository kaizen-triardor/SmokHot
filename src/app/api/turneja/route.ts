import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'

function transform(event: any) {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    date: event.date?.toISOString?.() ?? event.date,
    time: event.time,
    status: event.status,
    highlight: event.highlight,
    description: event.description,
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
    updatedAt: event.updatedAt?.toISOString?.() ?? event.updatedAt,
  }
}

export type PublicTourEvent = ReturnType<typeof transform>

export async function GET() {
  try {
    const result = await withTimeoutFallback(
      async () => {
        const events = await prisma.tourEvent.findMany({ orderBy: { date: 'desc' } })
        return events.map(transform)
      },
      () => getSnapshot<PublicTourEvent[]>('turneja'),
    )

    if (result.source === 'live') void saveSnapshot('turneja', result.data)

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    })
  } catch (error) {
    console.error('Public tour events GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
