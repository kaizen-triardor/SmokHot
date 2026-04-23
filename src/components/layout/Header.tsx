'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

export default function Header() {
  const pathname = usePathname()
  const t = useTranslations('Nav')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('smokhot-cart')
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)
            const total = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
            setItemCount(total)
          } catch {
            setItemCount(0)
          }
        } else {
          setItemCount(0)
        }
      }
    }

    updateCount()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', updateCount)
      window.addEventListener('cartUpdated', updateCount)

      return () => {
        window.removeEventListener('storage', updateCount)
        window.removeEventListener('cartUpdated', updateCount)
      }
    }
  }, [])

  // Public header never renders on admin routes (check happens AFTER hooks
  // so React's hook order stays stable across renders).
  if (pathname?.startsWith('/admin')) return null

  const navigation = [
    { key: 'home', href: '/' },
    { key: 'shop', href: '/shop' },
    { key: 'blog', href: '/blog' },
    { key: 'galerija', href: '/galerija' },
    { key: 'oNama', href: '/o-nama' },
    { key: 'kontakt', href: '/kontakt' },
  ] as const

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-primary-950/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3 -m-1.5 p-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-warning-400 bg-black/20 p-1">
              <Image
                src="/SmokHotLogo.png"
                alt="SmokHot Logo"
                width={32}
                height={32}
                className="h-auto w-auto object-contain"
              />
            </div>
            <div className="text-left">
              <div className="text-xl font-black uppercase tracking-[0.12em] text-white font-display">
                SMOKIN&apos; HOT
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd400]">
                COLLECTIVE
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">{t('openMenu')}</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`text-sm font-bold uppercase tracking-[0.1em] transition ${
                pathname === item.href
                  ? 'text-ember-500'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>

        {/* Language switcher + Cart */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          <LanguageSwitcher />
          <Link
            href="/korpa"
            className="relative -m-2 flex items-center p-2"
          >
            <ShoppingBagIcon className="h-6 w-6 text-white" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ember-500 text-xs font-black text-white">
                {itemCount}
              </span>
            )}
            <span className="ml-2 text-sm font-bold text-white/80">{t('cart')}</span>
          </Link>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l-2 border-fire-500/40 bg-[#111113] px-6 py-6 shadow-2xl sm:max-w-sm sm:ring-1 sm:ring-white/10">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 -m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-warning-400 bg-black/20 p-1">
                    <Image
                      src="/SmokHotLogo.png"
                      alt="SmokHot Logo"
                      width={24}
                      height={24}
                      className="h-auto w-auto object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-black uppercase tracking-[0.12em] text-white font-display">
                      SMOKIN&apos; HOT
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd400]">
                      COLLECTIVE
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">{t('closeMenu')}</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-white/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-bold uppercase tracking-[0.1em] transition ${
                          pathname === item.href
                            ? 'bg-ember-500 text-white'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>

                  <div className="py-6">
                    <Link
                      href="/korpa"
                      className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-bold text-white/80 hover:bg-white/5 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBagIcon className="h-6 w-6 mr-3" />
                      {t('cart')}
                      {itemCount > 0 && (
                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-ember-500 text-xs font-black text-white">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="py-6">
                    <LanguageSwitcher variant="mobile" onSelect={() => setMobileMenuOpen(false)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
