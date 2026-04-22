import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    // Read low-stock threshold from Settings; default to 10 if missing.
    const lowStockSetting = await prisma.setting.findUnique({
      where: { key: 'low_stock_alert' },
    })
    const lowStockThreshold = lowStockSetting?.value ? parseInt(lowStockSetting.value, 10) : 10

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      deliveredOrders,
      revenueAgg,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.product.count({
        where: {
          AND: [
            { inStock: true },
            { stockCount: { lt: Number.isFinite(lowStockThreshold) ? lowStockThreshold : 10 } },
          ],
        },
      }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.aggregate({
        where: { status: 'delivered' },
        _sum: { totalAmount: true },
      }),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        items: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      lowStockThreshold,
      deliveredOrders,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
      recentOrders,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
