'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Squares2X2Icon,
  FireIcon,
  ShoppingBagIcon,
  MapIcon,
  PencilSquareIcon,
  PhotoIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { ConfirmModalProvider } from '@/components/admin/ConfirmModal'

interface AdminLayoutProps {
  children: React.ReactNode
}

// Breadcrumb labels for each admin path
const BREADCRUMB_LABELS: Record<string, string> = {
  '/admin': 'Login',
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Proizvodi',
  '/admin/orders': 'Porudžbine',
  '/admin/turneja': 'Turneja',
  '/admin/blog': 'Blog',
  '/admin/galerija': 'Galerija',
  '/admin/settings': 'Postavke',
  '/admin/profile': 'Moj nalog',
  '/admin/audit-log': 'Audit log',
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Login page handles its own auth (no-op here)
    if (pathname === '/admin') {
      setLoading(false)
      return
    }

    // Cookie-based auth: ask the server who we are
    fetch('/api/admin/me', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) {
          // Middleware will have redirected us, but belt-and-suspenders:
          router.push('/admin')
          return
        }
        const data = await res.json()
        setAdminEmail(data.email ?? null)
        setIsAuthenticated(true)
      })
      .catch(() => {
        router.push('/admin')
      })
      .finally(() => setLoading(false))
  }, [router, pathname])

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } catch {
      /* ignore — redirect anyway */
    }
    setIsAuthenticated(false)
    router.push('/admin')
  }

  const breadcrumb = useMemo(() => {
    if (!pathname) return []
    const parts = pathname.split('/').filter(Boolean) // e.g. ['admin','products']
    const chain: { label: string; href: string }[] = []
    let acc = ''
    for (const p of parts) {
      acc += `/${p}`
      chain.push({
        label: BREADCRUMB_LABELS[acc] ?? p.charAt(0).toUpperCase() + p.slice(1),
        href: acc,
      })
    }
    return chain
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <div className="text-white">Učitavanje...</div>
      </div>
    )
  }

  // Login page — unwrapped (no sidebar).
  if (pathname === '/admin') {
    return <>{children}</>
  }

  if (!isAuthenticated) return null

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', Icon: Squares2X2Icon },
    { name: 'Proizvodi', href: '/admin/products', Icon: FireIcon },
    { name: 'Porudžbine', href: '/admin/orders', Icon: ShoppingBagIcon },
    { name: 'Turneja', href: '/admin/turneja', Icon: MapIcon },
    { name: 'Blog', href: '/admin/blog', Icon: PencilSquareIcon },
    { name: 'Galerija', href: '/admin/galerija', Icon: PhotoIcon },
    { name: 'Postavke', href: '/admin/settings', Icon: Cog6ToothIcon },
    { name: 'Audit log', href: '/admin/audit-log', Icon: ClipboardDocumentListIcon },
  ]

  return (
    <ConfirmModalProvider>
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
        {/* Background */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
        <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ember-500 to-fire-500">
              <FireIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-sm font-black uppercase tracking-[0.15em] text-white">
              SmokHot Admin
            </span>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-white/80 hover:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Otvori meni"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <div className="relative z-10 flex">
          {/* Sidebar — desktop permanent, mobile drawer */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#111113] transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
              mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex h-full flex-col p-5">
              <div className="mb-6 flex items-center justify-between">
                <Link href={'/admin/dashboard' as any} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ember-500 to-fire-500">
                    <FireIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-black uppercase tracking-[0.1em] text-white">
                      SmokHot
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ember-500">
                      Admin Panel
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2 text-white/70 hover:text-white lg:hidden"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Zatvori meni"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.Icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href as any}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'bg-ember-500 text-white shadow-[0_4px_14px_-4px_rgba(255,106,0,0.5)]'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Profile + logout */}
              <div className="mt-6 border-t border-white/10 pt-4 space-y-1">
                <Link
                  href={'/admin/profile' as any}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    pathname === '/admin/profile'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="truncate">Moj nalog</span>
                </Link>
                {adminEmail && (
                  <div className="px-3 pt-1 text-[11px] leading-tight text-white/40">
                    Ulogovan: <span className="break-all text-white/60">{adminEmail}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Odjavi se
                </button>
              </div>
            </div>
          </aside>

          {/* Scrim for mobile drawer */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main content */}
          <main className="min-h-screen flex-1">
            {/* Breadcrumbs */}
            {breadcrumb.length > 1 && (
              <div className="border-b border-white/10 bg-[#0b0b0d]/60 px-4 py-2.5 lg:px-6">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
                  {breadcrumb.map((crumb, i) => {
                    const last = i === breadcrumb.length - 1
                    return (
                      <span key={crumb.href} className="flex items-center gap-1">
                        {i > 0 && <ChevronRightIcon className="h-3 w-3 text-white/30" />}
                        {last ? (
                          <span className="font-semibold text-white">{crumb.label}</span>
                        ) : (
                          <Link
                            href={crumb.href as any}
                            className="text-white/50 transition hover:text-white"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </span>
                    )
                  })}
                </nav>
              </div>
            )}

            <div className="p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </ConfirmModalProvider>
  )
}
