'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { HEAT_CONFIG } from '@/types/product'
import { ArrowLeftIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<any | null>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [productRes, allRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/products'),
        ])

        if (productRes.ok) {
          const productData = await productRes.json()
          setProduct(productData)
        } else {
          setProduct(null)
        }

        if (allRes.ok) {
          const allData = await allRes.json()
          setAllProducts(Array.isArray(allData) ? allData : allData.products || [])
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const addToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)

    try {
      const existingCart = localStorage.getItem('smokhot-cart')
      const cartItems = existingCart ? JSON.parse(existingCart) : []

      const existingItemIndex = cartItems.findIndex((item: { productId: string }) => item.productId === product.slug)

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity
      } else {
        cartItems.push({ productId: product.slug, quantity })
      }

      localStorage.setItem('smokhot-cart', JSON.stringify(cartItems))
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      setAddedFeedback(true)
      setTimeout(() => {
        setIsAddingToCart(false)
        setAddedFeedback(false)
      }, 1500)

    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7] flex items-center justify-center">
        <p className="text-lg text-white/70">Učitavanje...</p>
      </div>
    )
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

  const heatConfig = HEAT_CONFIG[product.heatLevel as keyof typeof HEAT_CONFIG] || HEAT_CONFIG.mild

  // Sort all products by heat for upsell navigation
  const sortedByHeat = [...allProducts].sort((a, b) => a.heatNumber - b.heatNumber)
  const currentIndex = sortedByHeat.findIndex(p => p.id === product.id)
  const milderProduct = currentIndex > 0 ? sortedByHeat[currentIndex - 1] : null
  const hotterProduct = currentIndex < sortedByHeat.length - 1 ? sortedByHeat[currentIndex + 1] : null

  // Related products: same heat level or shared category, excluding current
  const productCategories = product.categories || product.category || []
  const relatedProducts = allProducts.filter(p => {
    if (p.id === product.id) return false
    const pCategories = p.categories || p.category || []
    return p.heatLevel === product.heatLevel || pCategories.some((cat: string) => productCategories.includes(cat))
  }).slice(0, 3)

  // Heat meter: position on the scale (1-4 mapped to 0-100%)
  const heatPercent = (product.heatNumber / 4) * 100

  const heatBarColors: Record<string, string> = {
    mild: 'bg-mild-500',
    hot: 'bg-warning-500',
    'extra-hot': 'bg-ember-500',
    'smokin-hot': 'bg-fire-500',
  }

  const heatBadgeColors: Record<string, string> = {
    mild: 'bg-mild-500',
    hot: 'bg-warning-500',
    'extra-hot': 'bg-ember-500',
    'smokin-hot': 'bg-fire-500',
  }

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
              {/* Product Image */}
              <div>
                <div className="aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 relative overflow-hidden">
                  {/* Heat badge */}
                  <div className={`absolute right-6 top-6 ${heatBadgeColors[product.heatLevel]} flex h-16 w-16 items-center justify-center rounded-full text-lg font-black text-white shadow-lg z-10`}>
                    {product.heatNumber}
                  </div>
                  {/* Product Image */}
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full grid-cols-2 gap-4 p-8">
                      <div className={`rounded-2xl ${heatBarColors[product.heatLevel]}/60`} style={{ opacity: 0.6 }} />
                      <div className={`rounded-2xl ${heatBarColors[product.heatLevel]}/40`} style={{ opacity: 0.4 }} />
                      <div className={`rounded-2xl ${heatBarColors[product.heatLevel]}/40`} style={{ opacity: 0.3 }} />
                      <div className={`rounded-2xl ${heatBarColors[product.heatLevel]}/20`} style={{ opacity: 0.2 }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                {/* Heat Level Badge */}
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${heatBadgeColors[product.heatLevel]} text-lg font-black text-white`}>
                    {product.heatNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/60">Nivo ljutine</div>
                    <div className="text-lg font-black uppercase text-white">
                      {heatConfig.label}
                    </div>
                  </div>
                  {product.scoville && (
                    <div className="ml-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70">
                      {product.scoville.toLocaleString()} SHU
                    </div>
                  )}
                </div>

                {/* Heat Meter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-[0.1em] text-white/40">
                    <span>Blago</span>
                    <span>Ljuto</span>
                    <span>Jako ljuto</span>
                    <span>Pakleno</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${heatBarColors[product.heatLevel]} transition-all duration-500`}
                      style={{ width: `${heatPercent}%` }}
                    />
                  </div>
                </div>

                {/* Product Title & Description */}
                <h1 className="mb-4 text-4xl font-black uppercase text-white lg:text-5xl">
                  {product.name}
                </h1>
                <p className="mb-4 text-lg font-bold text-white/80">{product.blurb}</p>
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
                {product.inStock ? (
                <div className="mb-8 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white/70">Količina:</span>
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
                    className={`flex items-center gap-3 rounded-xl border-2 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] disabled:opacity-50 ${
                      addedFeedback
                        ? 'border-mild-500 bg-mild-500'
                        : 'border-ember-500 bg-ember-500'
                    }`}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {addedFeedback ? 'Dodato!' : isAddingToCart ? 'Dodaje se...' : 'Dodaj u korpu'}
                  </button>
                </div>
                ) : (
                <div className="mb-8">
                  <div className="flex items-center justify-center rounded-xl border-2 border-red-700 bg-red-700 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white cursor-not-allowed">
                    Nema na stanju
                  </div>
                </div>
                )}

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-bold uppercase text-white">Sastojci</h3>
                  <div className="flex flex-wrap gap-2">
                    {(product.ingredients || []).map((ingredient: string, index: number) => (
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
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-bold uppercase text-white">Odlično za</h3>
                  <div className="flex flex-wrap gap-2">
                    {(product.pairings || []).map((pairing: string, index: number) => (
                      <span
                        key={index}
                        className={`rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-sm font-bold text-ember-500`}
                      >
                        {pairing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nutrition Info */}
                {product.nutritionInfo && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-bold uppercase text-white">Nutritivne vrednosti</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: 'Kalorije', value: `${product.nutritionInfo.calories}` },
                        { label: 'Masti', value: `${product.nutritionInfo.fat}g` },
                        { label: 'Ugljeni hidrati', value: `${product.nutritionInfo.carbs}g` },
                        { label: 'Proteini', value: `${product.nutritionInfo.protein}g` },
                        { label: 'Natrijum', value: `${product.nutritionInfo.sodium}mg` },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                          <div className="text-lg font-bold text-white">{item.value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock & Delivery */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Na stanju:</span>
                    <span className={`text-sm font-bold ${product.stockCount > 10 ? 'text-mild-500' : 'text-warning-500'}`}>
                      {product.stockCount} kom
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    Pouzeće širom Srbije · Plati kad stigne · Dostava 1-3 dana
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upsell Section */}
        {(milderProduct || hotterProduct) && (
          <section className="border-t border-white/8 bg-[#111113] py-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {milderProduct && (
                  <Link
                    href={`/shop/${milderProduct.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-mild-500/20 bg-mild-500/5 p-6 transition-all hover:-translate-y-1 hover:bg-mild-500/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mild-500 text-lg font-black text-white">
                      {milderProduct.heatNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.15em] text-mild-500">Prejako? Probaj blaže</div>
                      <div className="text-lg font-bold text-white group-hover:text-mild-500 transition-colors">{milderProduct.name}</div>
                      <div className="text-sm text-white/60">{milderProduct.price} RSD</div>
                    </div>
                    <div className="ml-auto text-white/40 group-hover:text-mild-500 transition-colors">→</div>
                  </Link>
                )}
                {hotterProduct && (
                  <Link
                    href={`/shop/${hotterProduct.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-fire-500/20 bg-fire-500/5 p-6 transition-all hover:-translate-y-1 hover:bg-fire-500/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fire-500 text-lg font-black text-white">
                      {hotterProduct.heatNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.15em] text-fire-500">Nije ti dosta? Idi na brutalnije</div>
                      <div className="text-lg font-bold text-white group-hover:text-fire-500 transition-colors">{hotterProduct.name}</div>
                      <div className="text-sm text-white/60">{hotterProduct.price} RSD</div>
                    </div>
                    <div className="ml-auto text-white/40 group-hover:text-fire-500 transition-colors">→</div>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-white/8 bg-surface py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-8 text-3xl font-black uppercase text-white">Slični sosovi</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct: any) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/shop/${relatedProduct.slug}`}
                    className="group rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6 transition-all hover:-translate-y-2"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`${heatBadgeColors[relatedProduct.heatLevel]} flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white`}>
                        {relatedProduct.heatNumber}
                      </div>
                      <span className="text-xs font-bold text-white/50">{relatedProduct.scoville?.toLocaleString()} SHU</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white group-hover:text-ember-500 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="mb-3 text-sm text-white/70">{relatedProduct.blurb}</p>
                    <div className="text-lg font-black text-ember-500">
                      {relatedProduct.price.toLocaleString()} RSD
                    </div>
                  </Link>
                ))}
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
