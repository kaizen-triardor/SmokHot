import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError, requireField } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { logAudit } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
    return NextResponse.json(settings)
  } catch (error) {
    return handlePrismaError(error, 'Postavke')
  }
}

export async function PUT(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const key = requireField(body.key, 'key') as string
    if (body.value === undefined) {
      return NextResponse.json({ error: 'Vrednost je obavezna.' }, { status: 400 })
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(body.value) },
      create: { key, value: String(body.value) },
    })

    refreshSnapshotAsync('settings')
    await logAudit(request, adminOrResp, {
      action: 'UPDATE',
      resource: 'settings',
      resourceId: key,
      summary: `Postavka: ${key} = ${String(body.value).slice(0, 60)}`,
    })

    return NextResponse.json(setting)
  } catch (error) {
    return handlePrismaError(error, 'Postavka')
  }
}
