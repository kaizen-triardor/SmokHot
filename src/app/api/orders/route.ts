import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/orders - Create a new order (public, no auth needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { customerName, customerPhone, customerAddress, notes, items, totalAmount, shippingCost } = body

    if (!customerName || !customerPhone || !customerAddress || !items || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerPhone, customerAddress, items, totalAmount' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        notes: notes || null,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        totalAmount: Math.round(totalAmount),
        status: 'pending',
        shippingCost: shippingCost ?? 0,
      },
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
      createdAt: order.createdAt.toISOString(),
    }, { status: 201 })

  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
