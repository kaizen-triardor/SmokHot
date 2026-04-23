'use client'

import { Link } from '@/i18n/navigation'
import { useState, useEffect } from 'react'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

interface CartItem {
  productId: string
  quantity: number
}

export default function KorpaPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage and fetch products on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('smokhot-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Error loading cart:', error)
        localStorage.removeItem('smokhot-cart')
      }
    }
    setIsInitialLoad(false)

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.products || [])
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Save cart to localStorage whenever cart changes (but skip if it's initial empty load)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('smokhot-cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isInitialLoad])

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('smokhot-cart')
  }

  const getProductDetails = (productId: string) => {
    return products.find(p => p.slug === productId || p.id === productId)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductDetails(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Delivery cost settings
  const DELIVERY_COST = 500
  const FREE_DELIVERY_THRESHOLD = 3000

  // Heat level styling — Tailwind JIT requires complete class names (no template interpolation).
  const heatLevelColors = {
    1: 'bg-mild-500',
    2: 'bg-warning-500',
    3: 'bg-ember-500',
    4: 'bg-fire-500',
    5: 'bg-red-600',
    6: 'bg-red-800'
  }

  const heatGradients: Record<number, { top: string; bottom: string }> = {
    1: { top: 'bg-gradient-to-br from-mild-500/60 to-mild-500/40', bottom: 'bg-gradient-to-br from-mild-500/40 to-mild-500/20' },
    2: { top: 'bg-gradient-to-br from-warning-500/60 to-warning-500/40', bottom: 'bg-gradient-to-br from-warning-500/40 to-warning-500/20' },
    3: { top: 'bg-gradient-to-br from-ember-500/60 to-ember-500/40', bottom: 'bg-gradient-to-br from-ember-500/40 to-ember-500/20' },
    4: { top: 'bg-gradient-to-br from-fire-500/60 to-fire-500/40', bottom: 'bg-gradient-to-br from-fire-500/40 to-fire-500/20' },
    5: { top: 'bg-gradient-to-br from-red-600/60 to-red-600/40', bottom: 'bg-gradient-to-br from-red-600/40 to-red-600/20' },
    6: { top: 'bg-gradient-to-br from-red-800/60 to-red-800/40', bottom: 'bg-gradient-to-br from-red-800/40 to-red-800/20' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7] flex items-center justify-center">
        <p className="text-lg text-white/70">Učitavanje...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Dotted Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Header */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
                Tvoja selekcija
              </p>
              <h1 className="text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
                Korpa
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                {totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? 'proizvod' : totalItems < 5 ? 'proizvoda' : 'proizvoda'} spreman za vatru`
                  : 'Tvoja korpa je prazna - vreme je da je zapališ!'
                }
              </p>
            </div>
          </div>
        </section>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <div className="mb-8 flex justify-center">
                <div className="rounded-full border-2 border-white/10 bg-white/5 p-8">
                  <svg className="h-24 w-24 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">
                Korpa je prazna kao nepce posle blagog sosa
              </h2>
              <p className="mb-8 text-white/70">
                Vreme je da dodaš nešto što će zapaliti tvoje obrroke!
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center border-2 border-fire-500 bg-fire-500 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                >
                  Istraži sosove
                </Link>
                <Link
                  href="/#heat-scale"
                  className="inline-flex items-center justify-center border-2 border-warning-400 bg-warning-400 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-black shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                >
                  Skala ljutine
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* Cart with Items */
          <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
                {/* Cart Items */}
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      Tvoji sosovi ({totalItems})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-white/60 transition hover:text-white"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Očisti korpu
                    </button>
                  </div>

                  <div className="space-y-6">
                    {cartItems.map((item) => {
                      const product = getProductDetails(item.productId)
                      if (!product) return null

                      const heatColor = heatLevelColors[product.heatNumber as keyof typeof heatLevelColors] || 'bg-ember-500'
                      const grad = heatGradients[product.heatNumber as keyof typeof heatGradients] || heatGradients[3]

                      return (
                        <div
                          key={item.productId}
                          className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6"
                        >
                          <div className="flex gap-4 sm:gap-6">
                            {/* Product Image Placeholder */}
                            <div className="flex-shrink-0">
                              <div className="h-32 w-20 sm:w-24 rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-3 sm:p-4">
                                <div className="grid h-full grid-cols-1 gap-2">
                                  <div className={`rounded-lg ${grad.top}`} />
                                  <div className={`rounded-lg ${grad.bottom}`} />
                                </div>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                  <p className="mt-1 text-sm text-white/70">{product.blurb}</p>

                                  {/* Heat Level */}
                                  <div className="mt-3 flex items-center gap-3">
                                    <div className={`${heatColor} flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white`}>
                                      {product.heatNumber}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                                      {product.heatNumber <= 1 ? 'Blago' : product.heatNumber <= 2 ? 'Ljuto' : product.heatNumber <= 3 ? 'Jako ljuto' : 'Ekstremno'}
                                    </span>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => removeItem(item.productId)}
                                  className="rounded-full border border-white/20 bg-white/5 p-2 text-white/60 transition hover:bg-red-500/20 hover:text-red-400"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>

                              {/* Quantity & Price — stacks on small screens so price can't overflow */}
                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <span className="text-sm font-bold text-white/70">Količina:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                      className="rounded-lg border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                      className="rounded-lg border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-left sm:text-right">
                                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                                    {item.quantity} x {product.price} RSD
                                  </div>
                                  <div className="text-2xl font-black text-ember-500 whitespace-nowrap">
                                    {(product.price * item.quantity).toLocaleString()} RSD
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <div className="sticky top-24">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8">
                      <h3 className="mb-6 text-2xl font-bold text-white">Pregled porudžbine</h3>

                      {/* Order Items */}
                      <div className="mb-6 space-y-3">
                        {cartItems.map((item) => {
                          const product = getProductDetails(item.productId)
                          if (!product) return null

                          return (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span className="text-white/70">
                                {product.name} x {item.quantity}
                              </span>
                              <span className="font-bold text-white">
                                {(product.price * item.quantity).toLocaleString()} RSD
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Total */}
                      <div className="mb-8 border-t border-white/10 pt-4">
                        <div className="mb-2 flex justify-between text-sm text-white/70">
                          <span>Dostava:</span>
                          <span>
                            {calculateTotal() >= FREE_DELIVERY_THRESHOLD
                              ? <span className="text-mild-500 font-bold">Besplatna</span>
                              : `${DELIVERY_COST} RSD`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="font-bold text-white">Ukupno:</span>
                          <span className="text-2xl font-black text-ember-500">
                            {(calculateTotal() + (calculateTotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST)).toLocaleString()} RSD
                          </span>
                        </div>
                        {calculateTotal() < FREE_DELIVERY_THRESHOLD && (
                          <p className="mt-2 text-xs text-mild-500">
                            Dodaj još {(FREE_DELIVERY_THRESHOLD - calculateTotal()).toLocaleString()} RSD za besplatnu dostavu!
                          </p>
                        )}
                        <p className="mt-2 text-xs text-white/50">
                          Plaćanje pouzećem
                        </p>
                      </div>

                      {/* Checkout Button */}
                      <Link
                        href="/porucivanje"
                        className="block w-full rounded-xl border-2 border-fire-500 bg-fire-500 py-4 text-center text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                      >
                        Poruči
                      </Link>

                      {/* COD Info */}
                      <div className="mt-6 rounded-xl border border-warning-400/20 bg-warning-400/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning-400 text-xs font-black text-black">
                            ℹ
                          </div>
                          <div className="text-sm text-white/70">
                            <div className="font-bold text-warning-400">Plaćanje pouzećem</div>
                            <div className="mt-1">
                              Platiš tek kada ti poštar donese paket. Bez rizika, bez čekanja.
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Continue Shopping */}
        <section className="border-t border-white/8 bg-surface py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Dodaj još vatire u korpu
            </h2>
            <p className="mb-8 text-white/70">
              Možda ti je potreban još jedan sos za kompletnu kolekciju?
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center border-2 border-warning-400 bg-warning-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1"
              >
                Pogledaj sve sosove
              </Link>
              <Link
                href="/#heat-scale"
                className="inline-flex items-center justify-center border-2 border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
              >
                Vrati se na skalu ljutine
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
