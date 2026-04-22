import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Neautorizovan pristup' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Nevaljan token' },
        { status: 401 }
      )
    }

    // Fetch dashboard statistics
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'pending' }
      }),
      prisma.product.count({
        where: {
          AND: [
            { inStock: true },
            { stockCount: { lt: 10 } }
          ]
        }
      })
    ])

    // Get recent orders for activity feed
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        items: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      recentOrders
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Server greška' },
      { status: 500 }
    )
  }
}