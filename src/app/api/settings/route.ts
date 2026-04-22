import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/settings - Public: return all settings as key-value object
export async function GET() {
  try {
    const settings = await prisma.setting.findMany()

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
