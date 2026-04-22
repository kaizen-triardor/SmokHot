'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

// Heat level configuration for visual progression
const allHeatConfig = [
  { level: 1, name: 'Blago', color: 'bg-mild-500', glow: 'shadow-[0_0_15px_rgba(152,184,60,0.3)]' },
  { level: 2, name: 'Ljuto', color: 'bg-warning-500', glow: 'shadow-[0_0_20px_rgba(255,212,0,0.4)]' },
  { level: 3, name: 'Jako ljuto', color: 'bg-ember-500', glow: 'shadow-[0_0_25px_rgba(255,106,0,0.5)]' },
  { level: 4, name: 'Pakleno', color: 'bg-fire-500', glow: 'shadow-[0_0_30px_rgba(229,36,33,0.6)]' },
  { level: 5, name: 'Ekstremno', color: 'bg-red-600', glow: 'shadow-[0_0_35px_rgba(220,38,127,0.7)]' },
  { level: 6, name: 'Smrtonosno', color: 'bg-red-800', glow: 'shadow-[0_0_40px_rgba(153,27,27,0.8)]' },
]

// Short badge labels that fit inside the circle
const heatBadgeLabel: Record<string, string> = {
  'mild': 'MILD',
  'hot': 'HOT',
  'extra-hot': 'X-HOT',
  'smokin-hot': 'XX-HOT',
}

function ProductCard({ product, heatConfig }: { product: any; heatConfig: typeof allHeatConfig }) {
  const [isAdding, setIsAdding] = useState(false)
  const heatConf = heatConfig.find(h => h.level === product.heatNumber) || heatConfig[0]

  const addToCart = async () => {
    setIsAdding(true)

    try {
      // Get existing cart
      const existingCart = localStorage.getItem('smokhot-cart')
      const cartItems = existingCart ? JSON.parse(existingCart) : []

      // Find existing item
      const existingItemIndex = cartItems.findIndex((item: any) => item.productId === product.slug)

      if (existingItemIndex >= 0) {
        // Update quantity
        cartItems[existingItemIndex].quantity += 1
      } else {
        // Add new item
        cartItems.push({
          productId: product.slug,
          quantity: 1
        })
      }

      // Save to localStorage
      localStorage.setItem('smokhot-cart', JSON.stringify(cartItems))

      // Trigger cart update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }

      setTimeout(() => setIsAdding(false), 500)

    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  return (
    <div className={`group relative rounded-3xl border-2 border-${heatConf.color}/30 bg-gradient-to-br from-surface to-primary-950 p-6 transition-all hover:-translate-y-2 hover:${heatConf.glow}`}>
      {/* Heat Badge */}
      <div className="absolute -right-3 -top-3">
        <div className={`${heatConf.color} flex h-16 w-16 items-center justify-center rounded-full text-[10px] font-black uppercase leading-tight tracking-[0.05em] text-white shadow-lg text-center`}>
          {heatBadgeLabel[product.heatLevel] || product.heatLevel}
        </div>
      </div>

      {/* Product Image */}
      <div className="mb-6 aspect-square rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 overflow-hidden">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full grid-cols-2 gap-4 p-8">
            <div className={`rounded-2xl bg-gradient-to-br from-${heatConf.color}/60 to-${heatConf.color}/40`} />
            <div className={`rounded-2xl bg-gradient-to-br from-${heatConf.color}/40 to-${heatConf.color}/20`} />
            <div className={`rounded-2xl bg-gradient-to-br from-${heatConf.color}/40 to-${heatConf.color}/20`} />
            <div className={`rounded-2xl bg-gradient-to-br from-${heatConf.color}/20 to-${heatConf.color}/10`} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <h3 className="mb-2 text-xl font-bold text-white">{product.name}</h3>
        <p className="text-sm text-white/70">{product.blurb}</p>
      </div>

      {/* Heat & Scoville */}
      <div className="mb-4 flex items-center gap-4 text-xs">
        <span className={`${heatConf.color} rounded-full px-3 py-1 font-bold text-white`}>
          {heatConf.name}
        </span>
        <span className="text-white/50">
          {product.scoville?.toLocaleString()} SHU
        </span>
      </div>

      {/* Price */}
      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-2xl font-black text-ember-500">
          {product.price} RSD
        </span>
        {product.originalPrice && (
          <span className="text-sm text-white/50 line-through">
            {product.originalPrice} RSD
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/shop/${product.slug}`}
          className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
        >
          Detalji
        </Link>

        {product.inStock ? (
          <button
            onClick={addToCart}
            disabled={isAdding}
            className="flex items-center justify-center rounded-xl border-2 border-ember-500 bg-ember-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-ember-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {isAdding ? 'Dodaje...' : 'U korpu'}
          </button>
        ) : (
          <div className="flex items-center justify-center rounded-xl border-2 border-red-700 bg-red-700 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white cursor-not-allowed">
            Nema na stanju
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  // Only show heat levels that have products
  const usedHeatLevels = new Set(products.map(p => p.heatNumber))
  const heatConfig = allHeatConfig.filter(h => usedHeatLevels.has(h.level))

  // Sort products by heat level
  const sortedProducts = [...products].sort((a, b) => a.heatNumber - b.heatNumber)

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
        {/* Page Header */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
              Srpski ljuti sosovi
            </p>
            <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
              Shop
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              Izaberi svoj nivo haosa. Od blagog gecko-ja do paklenog jackal-a -
              svaki sos je ručno napravljen sa ljubavlju i vatrom.
            </p>
          </div>
        </div>
      </section>

      {/* Heat Scale Reference */}
      {heatConfig.length > 0 && (
      <section className="border-b border-white/8 bg-surface py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Skala ljutine</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {heatConfig.map((heat) => (
              <div key={heat.level} className="flex items-center gap-2">
                <div className={`${heat.color} h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                  {heat.level}
                </div>
                <span className="text-sm text-white/70">{heat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

        {/* Products Grid */}
        <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-white/70">Nema dostupnih proizvoda.</p>
            </div>
          ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} heatConfig={heatConfig} />
            ))}
          </div>
          )}
        </div>
      </section>

        {/* COD Info */}
        <section className="border-t border-white/8 bg-surface py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Plaćanje pouzećem
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Nema rizika, nema čekanja. Naruči sada, plati kada pakovanje stigne na vrata.
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ember-500" />
              <span className="text-white/60">Dostava 1-3 dana</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning-400" />
              <span className="text-white/60">Bez plaćanja unapred</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-mild-500" />
              <span className="text-white/60">Proverava kvalitet pre plaćanja</span>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}
