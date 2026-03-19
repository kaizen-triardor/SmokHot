'use client'

import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon, EyeIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface Order {
  id: string
  orderNumber: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    note?: string
  }
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
  }[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  timestamp: string
  paymentMethod: string
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock orders data (in production, this would come from API)
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'SH-123456',
        customer: {
          firstName: 'Marko',
          lastName: 'Petrović',
          email: 'marko@example.com',
          phone: '060 123 4567',
          address: 'Bulevar Oslobođenja 123',
          city: 'Beograd',
          postalCode: '11000',
          note: 'Pozovite pre dostave'
        },
        items: [
          {
            productId: 'fireant-hot',
            productName: 'Fireant Hot',
            quantity: 2,
            price: 590
          },
          {
            productId: 'gecko-mild',
            productName: 'Gecko Mild',
            quantity: 1,
            price: 590
          }
        ],
        total: 1770,
        status: 'pending',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        paymentMethod: 'COD'
      },
      {
        id: '2',
        orderNumber: 'SH-123457',
        customer: {
          firstName: 'Ana',
          lastName: 'Milić',
          email: 'ana@example.com',
          phone: '064 987 6543',
          address: 'Knez Mihailova 45',
          city: 'Novi Sad',
          postalCode: '21000'
        },
        items: [
          {
            productId: 'jackal-smokin-hot',
            productName: 'Jackal Smokin\' Hot',
            quantity: 1,
            price: 850
          }
        ],
        total: 850,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        paymentMethod: 'COD'
      }
    ]
    setOrders(mockOrders)
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'confirmed': return 'bg-blue-500/20 text-blue-400'
      case 'shipped': return 'bg-purple-500/20 text-purple-400'
      case 'delivered': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Na čekanju'
      case 'confirmed': return 'Potvrđena'
      case 'shipped': return 'Poslata'
      case 'delivered': return 'Isporučena'
      case 'cancelled': return 'Otkazana'
      default: return status
    }
  }

  const OrderDetails = ({ order, onClose }: { order: Order, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Porudžbina {order.orderNumber}</h2>
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
                <p className="text-sm text-white/60">Ime i prezime</p>
                <p className="text-white font-medium">{order.customer.firstName} {order.customer.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Telefon</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{order.customer.phone}</p>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition"
                  >
                    <PhoneIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{order.customer.email}</p>
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                  >
                    <EnvelopeIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60">Grad</p>
                <p className="text-white font-medium">{order.customer.city} {order.customer.postalCode}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-white/60">Adresa</p>
                <p className="text-white font-medium">{order.customer.address}</p>
              </div>
              {order.customer.note && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-white/60">Napomena</p>
                  <p className="text-white font-medium">{order.customer.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Poručeni proizvodi</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-white font-medium">{item.productName}</p>
                    <p className="text-sm text-white/60">Količina: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{(item.price * item.quantity).toLocaleString()} RSD</p>
                    <p className="text-sm text-white/60">{item.price} RSD / kom</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <p className="text-lg font-bold text-white">UKUPNO:</p>
                <p className="text-xl font-bold text-ember-500">{order.total.toLocaleString()} RSD</p>
              </div>
              <p className="text-sm text-white/60 text-right">+ dostava (plaćanje pouzećem)</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Detalji porudžbine</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/60">Plaćanje</p>
                <p className="text-white font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Datum</p>
                <p className="text-white font-medium">{new Date(order.timestamp).toLocaleString('sr-RS')}</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Promeni status</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(order.id, status as Order['status'])}
                  className={`p-3 rounded-lg border transition ${
                    order.status === status 
                      ? 'border-ember-500 bg-ember-500/20 text-white' 
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {getStatusText(status as Order['status'])}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upravljanje porudžbinama</h1>
        <p className="mt-2 text-white/70">Pregled i upravljanje porudžbinama</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <input
            type="text"
            placeholder="Pretraži porudžbine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-xl border border-white/20 bg-surface/50 px-4 py-2 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/20 bg-surface/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
          >
            <option value="all">Svi statusi</option>
            <option value="pending">Na čekanju</option>
            <option value="confirmed">Potvrđene</option>
            <option value="shipped">Poslate</option>
            <option value="delivered">Isporučene</option>
            <option value="cancelled">Otkazane</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-bold text-white/80">Porudžbina</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Kupac</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Ukupno</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Status</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Datum</th>
                <th className="text-right p-4 text-sm font-bold text-white/80">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-white">{order.orderNumber}</div>
                      <div className="text-sm text-white/60">{order.items.length} proizvod{order.items.length > 1 ? 'a' : ''}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">{order.customer.firstName} {order.customer.lastName}</div>
                      <div className="text-sm text-white/60">{order.customer.city}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">{order.total.toLocaleString()} RSD</div>
                    <div className="text-sm text-white/60">{order.paymentMethod}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-white/70">
                      {new Date(order.timestamp).toLocaleDateString('sr-RS')}
                    </div>
                    <div className="text-sm text-white/50">
                      {new Date(order.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">Nema porudžbina koje odgovaraju filterima</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}