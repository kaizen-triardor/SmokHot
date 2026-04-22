'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FireIcon,
  ShoppingBagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import WarmServeWidget from './WarmServeWidget'

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
  totalRevenue?: number
  deliveredOrders?: number
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
        headers: { Authorization: `Bearer ${token}` },
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
        <div className="text-white">Učitavanje…</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Proizvodi',
      value: stats?.totalProducts ?? 0,
      subtitle: 'Ukupno proizvoda',
      ringClass: 'bg-mild-500/20 text-mild-400',
      Icon: FireIcon,
    },
    {
      title: 'Porudžbine',
      value: stats?.totalOrders ?? 0,
      subtitle: 'Ukupno porudžbina',
      ringClass: 'bg-ember-500/20 text-ember-400',
      Icon: ShoppingBagIcon,
    },
    {
      title: 'Na čekanju',
      value: stats?.pendingOrders ?? 0,
      subtitle: 'Čekaju potvrdu',
      ringClass: 'bg-warning-400/20 text-warning-400',
      Icon: ClockIcon,
    },
    {
      title: 'Malo zaliha',
      value: stats?.lowStockProducts ?? 0,
      subtitle: 'Proizvodi ispod praga',
      ringClass: 'bg-fire-500/20 text-fire-400',
      Icon: ExclamationTriangleIcon,
    },
  ]

  const revenueCard = typeof stats?.totalRevenue === 'number'
  const revenueCards = revenueCard
    ? [
        {
          title: 'Prihod (isporučene)',
          value: `${(stats!.totalRevenue ?? 0).toLocaleString()} RSD`,
          subtitle: `${stats?.deliveredOrders ?? 0} isporučenih porudžbina`,
          ringClass: 'bg-emerald-500/20 text-emerald-400',
          Icon: CurrencyDollarIcon,
        },
      ]
    : []

  const quickActions = [
    {
      title: 'Upravljanje proizvodima',
      description: 'Dodaj, uredi ili obriši ljute sosove',
      href: '/admin/products',
      Icon: FireIcon,
      tint: 'from-mild-500/20 to-mild-600/10',
    },
    {
      title: 'Porudžbine (pouzeće)',
      description: 'Pregled i obrada porudžbina',
      href: '/admin/orders',
      Icon: ShoppingBagIcon,
      tint: 'from-ember-500/20 to-ember-600/10',
    },
    {
      title: 'Turneja',
      description: 'Upravljaj događajima i nastupima',
      href: '/admin/turneja',
      Icon: MapIcon,
      tint: 'from-purple-500/20 to-purple-600/10',
    },
    {
      title: 'Blog',
      description: 'Objavi priče i recepte',
      href: '/admin/blog',
      Icon: PencilSquareIcon,
      tint: 'from-blue-500/20 to-blue-600/10',
    },
    {
      title: 'Galerija',
      description: 'Upravljaj fotografijama',
      href: '/admin/galerija',
      Icon: PhotoIcon,
      tint: 'from-teal-500/20 to-teal-600/10',
    },
    {
      title: 'Podešavanja',
      description: 'Dostava, plaćanje, stanje shop-a',
      href: '/admin/settings',
      Icon: Cog6ToothIcon,
      tint: 'from-yellow-500/20 to-yellow-600/10',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-[0.03em] text-white">Dashboard</h1>
        <p className="mt-2 text-white/70">Pregled sistema i brze akcije</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...statCards, ...revenueCards].map(({ title, value, subtitle, ringClass, Icon }, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-[#111113]/70 p-5 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-2xl font-black text-white sm:text-3xl">{value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">
                  {title}
                </div>
                <div className="mt-1 text-xs text-white/50">{subtitle}</div>
              </div>
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${ringClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warm-serve status widget */}
      <div className="mb-8">
        <WarmServeWidget />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-5 w-5 text-ember-500" />
          <h2 className="text-lg font-bold text-white">Brze akcije</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, i) => {
            const Icon = action.Icon
            return (
              <Link
                key={i}
                href={action.href as any}
                className="group block rounded-2xl border border-white/10 bg-[#111113]/70 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#111113]"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.tint}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">{action.title}</h3>
                <p className="mt-1 text-sm text-white/60">{action.description}</p>
                <div className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-ember-400 group-hover:text-ember-300">
                  Otvori →
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Poslednje porudžbine</h2>
        <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-5">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
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
                  itemSummary = items
                    .map((i: { name?: string; quantity?: number }) => `${i.quantity || 1}× ${i.name || 'Proizvod'}`)
                    .join(', ')
                } catch {
                  itemSummary = 'Detalji porudžbine'
                }
                const date = new Date(order.createdAt)
                const timeAgo = Math.floor((Date.now() - date.getTime()) / 3600000)
                const timeStr = timeAgo < 1 ? 'Upravo' : timeAgo < 24 ? `Pre ${timeAgo}h` : `Pre ${Math.floor(timeAgo / 24)} dana`
                return (
                  <Link
                    key={order.id}
                    href={'/admin/orders' as any}
                    className="flex items-center gap-4 rounded-xl bg-black/20 p-4 transition hover:bg-black/30"
                  >
                    <div className={`h-2 w-2 rounded-full ${statusColors[order.status] || 'bg-white/40'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        #{order.orderNumber}
                      </div>
                      <div className="text-xs text-white/60">
                        {itemSummary} • {order.totalAmount.toLocaleString()} RSD
                      </div>
                    </div>
                    <div className="text-xs text-white/50">{timeStr}</div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-white/50">Još nema porudžbina</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
