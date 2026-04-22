'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RecentOrder {
  id: string
  orderNumber: string
  items: string
  totalAmount: number
  status: string
  createdAt: string
}

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: RecentOrder[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Učitavanje...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/70">Pregled sistema i brze akcije</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Proizvodi',
            value: stats?.totalProducts || 6,
            subtitle: 'Ukupno proizvoda',
            color: 'bg-mild-500/20 text-mild-400',
            icon: '🌶️'
          },
          {
            title: 'Porudžbine',
            value: stats?.totalOrders || 0,
            subtitle: 'Ukupno porudžbina',
            color: 'bg-ember-500/20 text-ember-400',
            icon: '📦'
          },
          {
            title: 'Na čekanju',
            value: stats?.pendingOrders || 0,
            subtitle: 'Pending porudžbine',
            color: 'bg-warning-400/20 text-warning-400',
            icon: '⏳'
          },
          {
            title: 'Malo zaliha',
            value: stats?.lowStockProducts || 0,
            subtitle: 'Proizvodi < 10',
            color: 'bg-fire-500/20 text-fire-400',
            icon: '⚠️'
          }
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-surface/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-white/80">
                  {stat.title}
                </div>
                <div className="text-xs text-white/50">
                  {stat.subtitle}
                </div>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-bold text-white">Brze akcije</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Upravljanje proizvodima',
              description: 'Dodaj, uredi ili obriši ljute sosove',
              href: '/admin/products',
              icon: '🌶️',
              color: 'from-mild-500/20 to-mild-600/10'
            },
            {
              title: 'Porudžbine (COD)',
              description: 'Pregled i upravljanje porudžbinama',
              href: '/admin/orders',
              icon: '📦',
              color: 'from-ember-500/20 to-ember-600/10'
            },
            {
              title: 'Turneja',
              description: 'Upravljaj događajima i nastupima',
              href: '/admin/turneja',
              icon: '🎤',
              color: 'from-purple-500/20 to-purple-600/10'
            },
            {
              title: 'Sadržaj stranice',
              description: 'Uredi tekstove, slike i sekcije',
              href: '/admin/content',
              icon: '📝',
              color: 'from-blue-500/20 to-blue-600/10'
            },
            {
              title: 'Podešavanja',
              description: 'Opšta podešavanja sajta',
              href: '/admin/settings',
              icon: '⚙️',
              color: 'from-yellow-500/20 to-yellow-600/10'
            }
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href as any}
              className="group block rounded-2xl border border-white/10 bg-surface/50 p-6 transition-all duration-300 hover:scale-105 hover:bg-surface/70"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                <span className="text-xl">{action.icon}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">
                {action.title}
              </h3>
              <p className="text-sm text-white/70">
                {action.description}
              </p>
              <div className="mt-4 text-xs font-medium uppercase tracking-wider text-ember-400 group-hover:text-ember-300">
                Otvori →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-white">Poslednje porudžbine</h2>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-warning-400',
                  confirmed: 'bg-blue-400',
                  shipped: 'bg-ember-400',
                  delivered: 'bg-mild-400',
                  cancelled: 'bg-red-400',
                }
                let itemSummary = ''
                try {
                  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                  itemSummary = items.map((i: { name?: string; quantity?: number }) =>
                    `${i.quantity || 1}x ${i.name || 'Proizvod'}`
                  ).join(', ')
                } catch { itemSummary = 'Detalji porudžbine' }

                const date = new Date(order.createdAt)
                const timeAgo = Math.floor((Date.now() - date.getTime()) / 3600000)
                const timeStr = timeAgo < 1 ? 'Upravo' : timeAgo < 24 ? `Pre ${timeAgo}h` : `Pre ${Math.floor(timeAgo / 24)} dana`

                return (
                  <div key={order.id} className="flex items-center gap-4 rounded-xl bg-black/20 p-4">
                    <div className={`h-2 w-2 rounded-full ${statusColors[order.status] || 'bg-white/40'}`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        Porudžbina #{order.orderNumber}
                      </div>
                      <div className="text-xs text-white/60">
                        {itemSummary} • {order.totalAmount.toLocaleString()} RSD
                      </div>
                    </div>
                    <div className="text-xs text-white/50">{timeStr}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/50">Još nema porudžbina</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}