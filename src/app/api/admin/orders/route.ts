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

// Helper to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// GET /api/admin/orders - List all orders with pagination
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('_start') || '0')
    const limit = parseInt(searchParams.get('_end') || '10') - page
    const allowedSortFields = ['createdAt', 'orderNumber', 'customerName', 'status', 'totalAmount', 'updatedAt']
    const rawSortField = searchParams.get('_sort') || 'createdAt'
    const sortField = allowedSortFields.includes(rawSortField) ? rawSortField : 'createdAt'
    const sortOrder = searchParams.get('_order') === 'ASC' ? 'asc' : 'desc'

    // Optional status filter
    const statusFilter = searchParams.get('status')

    const where = statusFilter ? { status: statusFilter } : {}

    const orders = await prisma.order.findMany({
      where,
      skip: page,
      take: limit,
      orderBy: {
        [sortField]: sortOrder,
      },
    })

    const total = await prisma.order.count({ where })

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      notes: order.notes,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingCost: order.shippingCost,
      trackingNumber: order.trackingNumber,
      adminNotes: order.adminNotes,
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }))

    const response = NextResponse.json(transformedOrders)
    response.headers.set('X-Total-Count', total.toString())
    return response

  } catch (error) {
    console.error('Admin Orders GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/orders - Bulk update order status
export async function PATCH(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, status } = body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids must be a non-empty array' },
        { status: 400 }
      )
    }

    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status },
    })

    return NextResponse.json({ updated: result.count })

  } catch (error) {
    console.error('Admin Orders PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
