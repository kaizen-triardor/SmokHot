'use client'

import { useState, useEffect, useCallback } from 'react'
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface OrderItem {
  productName?: string
  name?: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  notes: string | null
  items: string | OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingCost: number | null
  trackingNumber: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

function parseItems(items: string | OrderItem[]): OrderItem[] {
  if (Array.isArray(items)) return items
  try {
    return JSON.parse(items)
  } catch {
    return []
  }
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Na cekanju' },
  { value: 'confirmed', label: 'Potvrdjena' },
  { value: 'shipped', label: 'Poslata' },
  { value: 'delivered', label: 'Isporucena' },
  { value: 'cancelled', label: 'Otkazana' },
]

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-400'
    case 'confirmed': return 'bg-blue-500/20 text-blue-400'
    case 'shipped': return 'bg-orange-500/20 text-orange-400'
    case 'delivered': return 'bg-green-500/20 text-green-400'
    case 'cancelled': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

function getStatusText(status: OrderStatus) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('admin-token') || ''

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/orders?_start=0&_end=50&_sort=createdAt&_order=DESC', {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('Niste autorizovani. Prijavite se ponovo.')
        throw new Error('Greska pri ucitavanju porudzbina.')
      }
      const data: Order[] = await res.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greska')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Greska pri promeni statusa.')
        return
      }
      await fetchOrders()
      // If the modal is open for this order, refresh it
      if (selectedOrder?.id === orderId) {
        const updated = await res.json().catch(() => null)
        if (updated) setSelectedOrder(updated)
      }
    } catch {
      alert('Greska pri promeni statusa.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ember-500 border-t-transparent" />
          <p className="text-white/60">Ucitavanje porudzbina...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="text-red-400 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="rounded-xl bg-ember-500 px-6 py-2 text-white font-medium hover:bg-ember-600 transition"
          >
            Pokusaj ponovo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upravljanje porudzbinama</h1>
        <p className="mt-2 text-white/70">Pregled i upravljanje porudzbinama ({orders.length})</p>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-bold text-white/80">Porudzbina</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Kupac</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Telefon</th>
                <th className="text-right p-4 text-sm font-bold text-white/80">Ukupno (RSD)</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Status</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Datum</th>
                <th className="text-right p-4 text-sm font-bold text-white/80">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-bold text-white">{order.orderNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{order.customerName}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/70">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-white font-bold">{Number(order.totalAmount).toLocaleString('sr-RS')}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-white focus:border-ember-500 focus:outline-none disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/70 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                    </div>
                    <div className="text-white/50 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                      title="Detalji"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">Nema porudzbina</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      )}
    </div>
  )
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  updatingId,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  updatingId: string | null
}) {
  const items = parseItems(order.items)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Porudzbina {order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Podaci o kupcu</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Ime</p>
                <p className="text-white font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Telefon</p>
                <p className="text-white font-medium">{order.customerPhone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-white/60">Adresa</p>
                <p className="text-white font-medium">{order.customerAddress || '-'}</p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-white/60">Napomena kupca</p>
                  <p className="text-white font-medium">{order.notes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-white/60">Admin napomene</p>
                  <p className="text-yellow-300 font-medium">{order.adminNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Poruceni proizvodi</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-white font-medium">{item.productName || item.name || 'Proizvod'}</p>
                    <p className="text-sm text-white/60">Kolicina: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{(item.price * item.quantity).toLocaleString('sr-RS')} RSD</p>
                    <p className="text-sm text-white/60">{Number(item.price).toLocaleString('sr-RS')} RSD / kom</p>
                  </div>
                </div>
              ))}

              {order.shippingCost != null && Number(order.shippingCost) > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <p className="text-white/70">Dostava</p>
                  <p className="text-white font-medium">{Number(order.shippingCost).toLocaleString('sr-RS')} RSD</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <p className="text-lg font-bold text-white">UKUPNO:</p>
                <p className="text-xl font-bold text-ember-500">{Number(order.totalAmount).toLocaleString('sr-RS')} RSD</p>
              </div>
            </div>
          </div>

          {/* Order Meta */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Detalji</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/60">Datum kreiranja</p>
                <p className="text-white font-medium">{new Date(order.createdAt).toLocaleString('sr-RS')}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Poslednja izmena</p>
                <p className="text-white font-medium">{new Date(order.updatedAt).toLocaleString('sr-RS')}</p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-white/60">Tracking broj</p>
                  <p className="text-white font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Promeni status</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={updatingId === order.id}
                  onClick={() => onStatusChange(order.id, opt.value)}
                  className={`p-3 rounded-lg border transition disabled:opacity-50 ${
                    order.status === opt.value
                      ? 'border-ember-500 bg-ember-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
