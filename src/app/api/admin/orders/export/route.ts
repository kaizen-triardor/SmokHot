import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

/**
 * GET /api/admin/orders/export
 *
 * Returns a CSV of all orders (or filtered by ?status=…, ?from=YYYY-MM-DD, ?to=YYYY-MM-DD).
 *
 * Auth: accepts either the Bearer header OR `?token=…` query param, so the admin
 * can open this URL in a new tab (browsers don't send Authorization headers
 * on anchor link navigations).
 */
function escape(val: unknown): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Auth — header or query-token
  const qToken = searchParams.get('token')
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const token = bearer || qToken
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + 'T23:59:59.999Z') } : {}),
    }
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'orderNumber',
      'createdAt',
      'status',
      'customerName',
      'customerPhone',
      'customerAddress',
      'itemSummary',
      'itemCount',
      'totalAmount',
      'shippingCost',
      'trackingNumber',
      'notes',
      'adminNotes',
    ]
    const rows: string[] = [headers.join(',')]

    for (const o of orders) {
      let parsedItems: Array<{ name?: string; productName?: string; quantity?: number; price?: number }> = []
      try {
        parsedItems = JSON.parse(o.items) as any[]
      } catch {
        parsedItems = []
      }
      const itemSummary = parsedItems
        .map((it) => `${it.quantity || 1}× ${it.name || it.productName || ''}`)
        .join(' | ')
      const itemCount = parsedItems.reduce((n, it) => n + (it.quantity || 1), 0)

      rows.push(
        [
          o.orderNumber,
          o.createdAt.toISOString(),
          o.status,
          o.customerName,
          o.customerPhone,
          o.customerAddress,
          itemSummary,
          itemCount,
          o.totalAmount,
          o.shippingCost ?? 0,
          o.trackingNumber ?? '',
          o.notes ?? '',
          o.adminNotes ?? '',
        ]
          .map(escape)
          .join(','),
      )
    }

    const csv = rows.join('\n')
    const filename = `smokhot-orders-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[orders/export] error:', err)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
