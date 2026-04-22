import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'

interface OrderItemInput {
  productId?: string // slug or id
  slug?: string
  id?: string
  name?: string
  productName?: string
  quantity: number
  price: number
}

/**
 * POST /api/orders — public checkout endpoint.
 *
 * Wraps the order creation in a prisma.$transaction that:
 *  1. Loads every referenced product (by slug or id)
 *  2. Verifies stock >= ordered quantity for each
 *  3. Decrements stock atomically
 *  4. Creates the order
 * If any product is insufficiently stocked OR the product no longer exists,
 * the whole transaction rolls back and returns 409 with details.
 *
 * This closes the oversell race-condition the audit flagged: without the
 * transaction, two simultaneous orders for the last bottle both succeed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      customerName,
      customerPhone,
      customerAddress,
      notes,
      items,
      totalAmount,
      shippingCost,
    } = body

    if (!customerName || !customerPhone || !customerAddress || !items || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Obavezna polja: customerName, customerPhone, customerAddress, items, totalAmount.' },
        { status: 400 },
      )
    }

    const parsedItems: OrderItemInput[] = Array.isArray(items)
      ? items
      : typeof items === 'string'
        ? JSON.parse(items)
        : []

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: 'Korpa je prazna.' }, { status: 400 })
    }

    // Normalize item keys — client may send productId as either slug OR id.
    const normalized = parsedItems.map((i) => ({
      identifier: i.slug ?? i.productId ?? i.id ?? '',
      quantity: Math.max(1, Number(i.quantity) || 1),
      priceClient: Number(i.price) || 0,
      nameClient: i.productName ?? i.name ?? '',
    }))

    if (normalized.some((n) => !n.identifier)) {
      return NextResponse.json(
        { error: 'Neka stavka u korpi nema ID proizvoda.' },
        { status: 400 },
      )
    }

    const orderNumber =
      'SH-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()

    try {
      const order = await prisma.$transaction(async (tx) => {
        // 1. Fetch every referenced product (by slug OR id — accept either).
        const products = await tx.product.findMany({
          where: {
            deletedAt: null,
            OR: normalized.flatMap((n) => [
              { slug: n.identifier },
              { id: n.identifier },
            ]),
          },
        })

        // 2. Verify every item resolves + stock sufficient.
        const resolved: Array<{
          product: (typeof products)[number]
          quantity: number
          name: string
          price: number
        }> = []
        for (const item of normalized) {
          const product = products.find((p) => p.slug === item.identifier || p.id === item.identifier)
          if (!product) {
            throw new OutOfStockError(`Proizvod "${item.nameClient || item.identifier}" više nije dostupan.`)
          }
          if (!product.inStock) {
            throw new OutOfStockError(`Proizvod "${product.name}" nije na stanju.`)
          }
          if (product.stockCount < item.quantity) {
            throw new OutOfStockError(
              `Nedovoljno zaliha za "${product.name}": dostupno ${product.stockCount}, traženo ${item.quantity}.`,
            )
          }
          resolved.push({ product, quantity: item.quantity, name: product.name, price: product.price })
        }

        // 3. Decrement stock per product.
        for (const r of resolved) {
          await tx.product.update({
            where: { id: r.product.id },
            data: {
              stockCount: { decrement: r.quantity },
              // If this empties the stock, auto-mark as out-of-stock.
              inStock: r.product.stockCount - r.quantity > 0,
            },
          })
        }

        // 4. Build the canonical items blob from server-truth prices/names.
        const itemsForDb = resolved.map((r) => ({
          productId: r.product.slug,
          name: r.name,
          productName: r.name,
          quantity: r.quantity,
          price: r.price,
        }))

        // 5. Create the order.
        return tx.order.create({
          data: {
            orderNumber,
            customerName,
            customerPhone,
            customerAddress,
            notes: notes || null,
            items: JSON.stringify(itemsForDb),
            totalAmount: Math.round(totalAmount),
            status: 'pending',
            shippingCost: shippingCost ?? 0,
          },
        })
      })

      // Fire-and-forget: refresh product snapshot so shop reflects new stock
      // on the next public GET.
      refreshSnapshotAsync('products')

      return NextResponse.json(
        {
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
        },
        { status: 201 },
      )
    } catch (err) {
      if (err instanceof OutOfStockError) {
        return NextResponse.json(
          { error: err.message, code: 'OUT_OF_STOCK' },
          { status: 409 },
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { error: 'Greška pri obradi porudžbine. Pokušajte ponovo.' },
      { status: 500 },
    )
  }
}

class OutOfStockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OutOfStockError'
  }
}
