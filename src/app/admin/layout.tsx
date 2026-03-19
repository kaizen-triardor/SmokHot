'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (!token && pathname !== '/admin') {
      router.push('/admin')
      return
    }
    
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    setIsAuthenticated(false)
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Login page - no layout
  if (pathname === '/admin') {
    return <>{children}</>
  }

  // Protected pages with sidebar layout
  if (!isAuthenticated) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Proizvodi', href: '/admin/products', icon: '🌶️' },
    { name: 'Porudžbine', href: '/admin/orders', icon: '📦' },
    { name: 'Turneja', href: '/admin/turneja', icon: '🎤' },
    { name: 'Sadržaj', href: '/admin/content', icon: '📝' },
    { name: 'Postavke', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className="w-64 bg-surface/50 border-r border-white/10 min-h-screen">
          <div className="p-6 h-full flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-ember-500 to-fire-500 flex items-center justify-center text-xl">
                🔥
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SmokHot</h1>
                <p className="text-xs text-white/60">Admin Panel</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    pathname === item.href
                      ? 'bg-ember-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-auto pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <span className="text-lg">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}