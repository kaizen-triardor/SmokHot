'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, products } from '@/data/products'
import { Product, HEAT_CONFIG } from '@/types/product'
import { ArrowLeftIcon, PlusIcon, MinusIcon, HeartIcon, ShareIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    if (slug) {
      console.log('Looking for product with slug:', slug)
      const foundProduct = getProductBySlug(slug)
      console.log('Found product:', foundProduct)
      setProduct(foundProduct || null)
    }
  }, [slug])

  const addToCart = async () => {
    if (!product) return
    
    setIsAddingToCart(true)
    
    try {
      // Get existing cart
      const existingCart = localStorage.getItem('smokhot-cart')
      const cartItems = existingCart ? JSON.parse(existingCart) : []
      
      // Find existing item
      const existingItemIndex = cartItems.findIndex((item: any) => item.productId === product.slug)
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cartItems[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        cartItems.push({
          productId: product.slug,
          quantity: quantity
        })
      }
      
      // Save to localStorage
      localStorage.setItem('smokhot-cart', JSON.stringify(cartItems))
      
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Visual feedback
      setTimeout(() => setIsAddingToCart(false), 500)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase text-white mb-4">Proizvod nije pronađen</h1>
          <p className="text-white/70 mb-8">Ovaj sos ne postoji u našoj kolekciji.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-2 border-ember-500 bg-ember-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Nazad na shop
          </Link>
        </div>
      </div>
    )
  }

  const heatConfig = HEAT_CONFIG[product.heatLevel] || HEAT_CONFIG.mild
  const relatedProducts = products.filter(p => 
    p.id !== product.id && 
    (p.heatLevel === product.heatLevel || (product.category && p.category.some(cat => product.category.includes(cat))))
  ).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Breadcrumb */}
        <section className="border-b border-white/8 bg-surface py-4">
          <div className="mx-auto max-w-7xl px-6">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-white/60 transition hover:text-white">Početna</Link>
              <span className="text-white/40">/</span>
              <Link href="/shop" className="text-white/60 transition hover:text-white">Shop</Link>
              <span className="text-white/40">/</span>
              <span className="text-white">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Product Images */}
              <div>
                <div className="mb-6">
                  <div className="aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8">
                    {/* Product Image Placeholder */}
                    <div className="grid h-full grid-cols-2 gap-4">
                      <div className={`rounded-2xl bg-gradient-to-br from-${heatConfig.color}-500/60 to-${heatConfig.color}-500/40`} />
                      <div className={`rounded-2xl bg-gradient-to-br from-${heatConfig.color}-500/40 to-${heatConfig.color}-500/20`} />
                      <div className={`rounded-2xl bg-gradient-to-br from-${heatConfig.color}-500/40 to-${heatConfig.color}-500/20`} />
                      <div className={`rounded-2xl bg-gradient-to-br from-${heatConfig.color}-500/20 to-${heatConfig.color}-500/10`} />
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails */}
                {product.images.gallery.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-xl border transition ${
                          selectedImageIndex === index
                            ? 'border-ember-500'
                            : 'border-white/20 hover:border-white/40'
                        } bg-gradient-to-br from-surface to-primary-950`}
                      >
                        <div className={`h-full w-full rounded-lg bg-gradient-to-br from-${heatConfig.color}-500/30 to-${heatConfig.color}-500/10`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                {/* Heat Level Badge */}
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-${heatConfig.color}-500 text-lg font-black text-white`}>
                    {product.heatNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/60">Heat Level</div>
                    <div className={`text-lg font-black uppercase text-${heatConfig.color}-500`}>
                      {heatConfig.label}
                    </div>
                  </div>
                  <div className="text-xs text-white/50">
                    {product.scoville?.toLocaleString()} SHU
                  </div>
                </div>

                {/* Product Title & Description */}
                <h1 className="mb-4 text-4xl font-black uppercase text-white lg:text-5xl">
                  {product.name}
                </h1>
                <p className="mb-6 text-lg text-white/70">{product.blurb}</p>
                <p className="mb-8 text-white/60 leading-relaxed">{product.description}</p>

                {/* Price */}
                <div className="mb-8 flex items-baseline gap-4">
                  <div className="text-3xl font-black text-ember-500">
                    {product.price.toLocaleString()} RSD
                  </div>
                  {product.originalPrice && (
                    <div className="text-lg text-white/50 line-through">
                      {product.originalPrice.toLocaleString()} RSD
                    </div>
                  )}
                  <div className="text-sm text-white/60">
                    ({product.volume})
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="mb-8 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Količina:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-lg border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="rounded-lg border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={isAddingToCart}
                    className="flex items-center gap-3 rounded-xl border-2 border-ember-500 bg-ember-500 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] disabled:opacity-50"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {isAddingToCart ? 'Dodaje se...' : 'Dodaj u korpu'}
                  </button>
                </div>

                {/* Product Details */}
                <div className="space-y-8">
                  {/* Ingredients */}
                  <div>
                    <h3 className="mb-4 text-xl font-bold uppercase text-white">Sastojci</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Food Pairings */}
                  <div>
                    <h3 className="mb-4 text-xl font-bold uppercase text-white">Odlično za</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.pairings.map((pairing, index) => (
                        <span
                          key={index}
                          className={`rounded-full border border-${heatConfig.color}-500/30 bg-${heatConfig.color}-500/10 px-3 py-1 text-sm font-bold text-${heatConfig.color}-500`}
                        >
                          {pairing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Na stanju:</span>
                      <span className={`text-sm font-bold ${product.stockCount > 10 ? 'text-mild-500' : 'text-warning-500'}`}>
                        {product.stockCount} kom
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      Plaćanje pouzećem • Dostava 1-3 dana
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-white/8 bg-surface py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-8 text-3xl font-black uppercase text-white">Slični sosovi</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => {
                  const relatedHeatConfig = HEAT_CONFIG[relatedProduct.heatLevel]
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/shop/${relatedProduct.slug}`}
                      className="group rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6 transition-all hover:-translate-y-2"
                    >
                      <div className="mb-4 aspect-square rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-4">
                        <div className={`h-full w-full rounded-xl bg-gradient-to-br from-${relatedHeatConfig.color}-500/40 to-${relatedHeatConfig.color}-500/20`} />
                      </div>
                      <h3 className="mb-2 font-bold text-white group-hover:text-ember-500 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="mb-3 text-sm text-white/70">{relatedProduct.blurb}</p>
                      <div className="text-lg font-black text-ember-500">
                        {relatedProduct.price.toLocaleString()} RSD
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Back to Shop */}
        <section className="border-t border-white/8 py-8">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-2 border-white/20 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Nazad na shop
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}