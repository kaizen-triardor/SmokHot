'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { XMarkIcon, EyeIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  allowedNextStatuses,
  type OrderStatus,
} from '@/lib/order-flow'

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

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const getToken = () => localStorage.getItem('admin-token') || ''

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/orders?_start=0&_end=200&_sort=createdAt&_order=DESC', {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('Niste autorizovani. Prijavite se ponovo.')
        throw new Error('Greška pri učitavanju porudžbina.')
      }
      const data: Order[] = await res.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (!q) return true
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      )
    })
  }, [orders, search, statusFilter])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Greška pri promeni statusa.')
        return
      }
      const updated = await res.json().catch(() => null)
      await fetchOrders()
      if (selectedOrder?.id === orderId && updated) setSelectedOrder(updated)
    } catch {
      alert('Greška pri promeni statusa.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    const ids = Array.from(bulkSelected)
    if (ids.length === 0) return
    if (!confirm(`Promeni status za ${ids.length} porudžbina na "${ORDER_STATUS_LABELS[newStatus]}"?`)) return

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ids, status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Greška pri bulk promeni.')
        return
      }
      setBulkSelected(new Set())
      await fetchOrders()
    } catch {
      alert('Greška pri bulk promeni.')
    }
  }

  const handleExportCsv = () => {
    window.open(`/api/admin/orders/export?token=${encodeURIComponent(getToken())}`, '_blank')
  }

  const toggleBulk = (id: string) => {
    const next = new Set(bulkSelected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setBulkSelected(next)
  }

  const toggleBulkAll = () => {
    if (bulkSelected.size === filteredOrders.length) setBulkSelected(new Set())
    else setBulkSelected(new Set(filteredOrders.map((o) => o.id)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ember-500 border-t-transparent" />
          <p className="text-white/60">Učitavanje porudžbina…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="mb-4 text-lg font-medium text-red-400">{error}</p>
          <button
            onClick={fetchOrders}
            className="rounded-xl bg-ember-500 px-6 py-2 font-medium text-white transition hover:bg-ember-600"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.03em] text-white">
            Upravljanje porudžbinama
          </h1>
          <p className="mt-2 text-white/70">Pregled i obrada porudžbina ({filteredOrders.length} / {orders.length})</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            CSV export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraga po broju, imenu ili telefonu…"
            className="w-full rounded-xl border border-white/15 bg-[#111113] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/40 focus:border-ember-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
              statusFilter === 'all'
                ? 'bg-ember-500 text-white'
                : 'border border-white/15 text-white/70 hover:text-white'
            }`}
          >
            Sve
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
                statusFilter === s
                  ? 'bg-ember-500 text-white'
                  : 'border border-white/15 text-white/70 hover:text-white'
              }`}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {bulkSelected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-ember-500/30 bg-ember-500/10 px-4 py-3">
          <span className="text-sm font-medium text-ember-300">
            Izabrano: {bulkSelected.size}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStatusChange('confirmed')}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-blue-600"
            >
              Potvrdi sve
            </button>
            <button
              onClick={() => handleBulkStatusChange('shipped')}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-orange-600"
            >
              Označi kao poslato
            </button>
            <button
              onClick={() => handleBulkStatusChange('delivered')}
              className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-green-600"
            >
              Označi kao isporučeno
            </button>
          </div>
          <button
            onClick={() => setBulkSelected(new Set())}
            className="ml-auto text-xs text-white/60 underline hover:text-white"
          >
            Otkaži izbor
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/70">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-black/20">
              <tr>
                <th className="w-10 p-3 text-center">
                  <input
                    type="checkbox"
                    checked={bulkSelected.size > 0 && bulkSelected.size === filteredOrders.length}
                    onChange={toggleBulkAll}
                    className="accent-ember-500"
                    aria-label="Izaberi sve"
                  />
                </th>
                <th className="p-4 text-left text-sm font-bold text-white/80">Porudžbina</th>
                <th className="p-4 text-left text-sm font-bold text-white/80">Kupac</th>
                <th className="p-4 text-left text-sm font-bold text-white/80">Telefon</th>
                <th className="p-4 text-right text-sm font-bold text-white/80">Ukupno (RSD)</th>
                <th className="p-4 text-left text-sm font-bold text-white/80">Status</th>
                <th className="p-4 text-left text-sm font-bold text-white/80">Datum</th>
                <th className="p-4 text-right text-sm font-bold text-white/80">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const nextStatuses = allowedNextStatuses(order.status)
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={bulkSelected.has(order.id)}
                        onChange={() => toggleBulk(order.id)}
                        className="accent-ember-500"
                        aria-label={`Izaberi ${order.orderNumber}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{order.orderNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{order.customerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white/70">{order.customerPhone}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-white">
                        {Number(order.totalAmount).toLocaleString('sr-RS')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-white focus:border-ember-500 focus:outline-none disabled:opacity-50"
                        >
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-white/70">
                        {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                      </div>
                      <div className="text-xs text-white/50">
                        {new Date(order.createdAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg bg-ember-500/20 p-2 text-ember-400 transition hover:bg-ember-500 hover:text-white"
                        title="Detalji"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-white/50">
              {orders.length === 0 ? 'Nema porudžbina' : 'Nijedna porudžbina ne odgovara filterima'}
            </p>
          </div>
        )}
      </div>

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
  const nextStatuses = allowedNextStatuses(order.status)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Porudžbina {order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-4 text-lg font-bold text-white">Podaci o kupcu</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Ime</p>
                <p className="font-medium text-white">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Telefon</p>
                <p className="font-medium text-white">
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">
                    {order.customerPhone}
                  </a>
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-white/60">Adresa</p>
                <p className="font-medium text-white">{order.customerAddress || '-'}</p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-white/60">Napomena kupca</p>
                  <p className="font-medium text-white">{order.notes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-white/60">Admin napomene</p>
                  <p className="font-medium text-yellow-300">{order.adminNotes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-4 text-lg font-bold text-white">Poručeni proizvodi</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-white/10 py-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">{item.productName || item.name || 'Proizvod'}</p>
                    <p className="text-sm text-white/60">Količina: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {(item.price * item.quantity).toLocaleString('sr-RS')} RSD
                    </p>
                    <p className="text-sm text-white/60">
                      {Number(item.price).toLocaleString('sr-RS')} RSD / kom
                    </p>
                  </div>
                </div>
              ))}

              {order.shippingCost != null && Number(order.shippingCost) > 0 && (
                <div className="flex items-center justify-between border-b border-white/10 py-2">
                  <p className="text-white/70">Dostava</p>
                  <p className="font-medium text-white">
                    {Number(order.shippingCost).toLocaleString('sr-RS')} RSD
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/20 pt-3">
                <p className="text-lg font-bold text-white">UKUPNO:</p>
                <p className="text-xl font-bold text-ember-500">
                  {Number(order.totalAmount).toLocaleString('sr-RS')} RSD
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-4 text-lg font-bold text-white">Detalji</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Status</p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/60">Datum kreiranja</p>
                <p className="font-medium text-white">
                  {new Date(order.createdAt).toLocaleString('sr-RS')}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Poslednja izmena</p>
                <p className="font-medium text-white">
                  {new Date(order.updatedAt).toLocaleString('sr-RS')}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-white/60">Tracking broj</p>
                  <p className="font-medium text-white">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions — only show allowed next transitions */}
          {nextStatuses.length > 1 && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h3 className="mb-4 text-lg font-bold text-white">Promeni status</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {nextStatuses
                  .filter((s) => s !== order.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={updatingId === order.id}
                      onClick={() => onStatusChange(order.id, s)}
                      className="rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white/80 transition hover:border-ember-500 hover:bg-ember-500/10 hover:text-white disabled:opacity-50"
                    >
                      → {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {nextStatuses.length === 1 && (
            <div className="rounded-xl border border-mild-500/20 bg-mild-500/5 p-4 text-sm text-mild-400">
              Terminalni status — nema daljih prelaza dostupnih.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
