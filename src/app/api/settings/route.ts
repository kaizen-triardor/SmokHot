import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'

export type PublicSettings = Record<string, string>

export async function GET() {
  try {
    const result = await withTimeoutFallback(
      async () => {
        const settings = await prisma.setting.findMany()
        const map: PublicSettings = {}
        for (const s of settings) map[s.key] = s.value
        return map
      },
      () => getSnapshot<PublicSettings>('settings'),
    )

    if (result.source === 'live') void saveSnapshot('settings', result.data)

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    })
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
