import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError } from '@/lib/admin-errors'
import { isValidStatus, isAllowedTransition, type OrderStatus } from '@/lib/order-flow'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('_start') || '0')
    const limit = parseInt(searchParams.get('_end') || '100') - page
    const allowedSortFields = ['createdAt', 'orderNumber', 'customerName', 'status', 'totalAmount', 'updatedAt']
    const rawSortField = searchParams.get('_sort') || 'createdAt'
    const sortField = allowedSortFields.includes(rawSortField) ? rawSortField : 'createdAt'
    const sortOrder = searchParams.get('_order') === 'ASC' ? 'asc' : 'desc'
    const statusFilter = searchParams.get('status')

    const where = statusFilter ? { status: statusFilter } : {}
    const orders = await prisma.order.findMany({
      where,
      skip: page,
      take: Math.max(1, limit),
      orderBy: { [sortField]: sortOrder },
    })
    const total = await prisma.order.count({ where })

    const transformed = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerAddress: o.customerAddress,
      notes: o.notes,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      shippingCost: o.shippingCost,
      trackingNumber: o.trackingNumber,
      adminNotes: o.adminNotes,
      estimatedDelivery: o.estimatedDelivery?.toISOString() || null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }))

    const response = NextResponse.json(transformed)
    response.headers.set('X-Total-Count', total.toString())
    return response
  } catch (error) {
    return handlePrismaError(error, 'Porudžbine')
  }
}

/**
 * PATCH /api/admin/orders — bulk status change.
 * Now enforces the same per-order transition rules as the [id] endpoint:
 * orders whose current state cannot legally transition to `status` are
 * skipped, and the response reports which were updated vs. skipped.
 */
export async function PATCH(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const { ids, status } = body as { ids?: string[]; status?: string }

    if (!status || !isValidStatus(status)) {
      return NextResponse.json({ error: 'Nepoznat status.' }, { status: 400 })
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '`ids` mora biti neprazan niz.' }, { status: 400 })
    }

    const target = status as OrderStatus

    // Fetch current statuses so we can decide per-order which are legal.
    const current = await prisma.order.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    })

    const updatableIds: string[] = []
    const skipped: { id: string; reason: string }[] = []

    for (const row of current) {
      const from = row.status as OrderStatus
      if (from === target) {
        skipped.push({ id: row.id, reason: 'already in target status' })
        continue
      }
      if (!isAllowedTransition(from, target)) {
        skipped.push({ id: row.id, reason: `illegal transition ${from} → ${target}` })
        continue
      }
      updatableIds.push(row.id)
    }

    let updated = 0
    if (updatableIds.length > 0) {
      const r = await prisma.order.updateMany({
        where: { id: { in: updatableIds } },
        data: { status: target },
      })
      updated = r.count
    }

    return NextResponse.json({ updated, skipped })
  } catch (error) {
    return handlePrismaError(error, 'Porudžbine')
  }
}
