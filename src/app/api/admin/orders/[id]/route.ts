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

// GET /api/admin/orders/[id] - Get single order detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
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
    })

  } catch (error) {
    console.error('Admin Order GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/orders/[id] - Update order status and details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition if status is being updated
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }

      // Enforce valid status transitions (pending → confirmed → shipped → delivered)
      const statusFlow: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['shipped', 'cancelled'],
        shipped: ['delivered', 'cancelled'],
        delivered: [], // terminal state
        cancelled: ['pending'], // allow reactivation
      }

      const allowedTransitions = statusFlow[existingOrder.status] || []
      if (!allowedTransitions.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from '${existingOrder.status}' to '${body.status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}` },
          { status: 400 }
        )
      }
    }

    // Build update data - only include fields that were sent
    const updateData: Record<string, unknown> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes
    if (body.estimatedDelivery !== undefined) updateData.estimatedDelivery = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null
    if (body.shippingCost !== undefined) updateData.shippingCost = body.shippingCost

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
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
    })

  } catch (error) {
    console.error('Admin Order PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
