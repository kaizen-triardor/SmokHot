'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { products } from '@/data/products'
import { useHomepage, useBrandInfo } from '@/lib/cms'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

interface TourEventApi {
  id: string
  title: string
  location: string
  date: string
  time: string
  status: string
  highlight: string | null
  description: string | null
}

interface CartItem {
  productId: string
  quantity: number
}

interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string
  blurb: string | null
  heatLevel: string
  heatNumber: number
  price: number
  originalPrice: number | null
  mainImage: string | null
  scoville: string | null
  inStock: boolean
  featured: boolean
  [key: string]: unknown
}

interface HeatScaleProduct {
  id: string
  name: string
  heat: string
  level: number
  blurb: string
  color: string
  bgColor: string
  price: number
  scoville: string
}

// Map heat levels to visual styles for progressive escalation
function getHeatStyles(heatLevel: string, heatNumber: number): { color: string; bgColor: string } {
  if (heatNumber <= 1) return { color: 'from-mild-500 to-mild-600', bgColor: 'bg-mild-500' }
  if (heatNumber <= 2) return { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500' }
  if (heatNumber <= 3) return { color: 'from-ember-500 to-ember-600', bgColor: 'bg-ember-500' }
  return { color: 'from-fire-500 to-red-700', bgColor: 'bg-fire-500' }
}

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [heatScaleProducts, setHeatScaleProducts] = useState<HeatScaleProduct[]>([])
  const [heatScaleLoading, setHeatScaleLoading] = useState(true)
  const [tourEvents, setTourEvents] = useState<TourEventApi[]>([])
  const [tourLoading, setTourLoading] = useState(true)
  // CMS Integration - All content can now be managed centrally
  const homepageContent = useHomepage()
  const brandInfo = useBrandInfo()

  // Load cart from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('smokhot-cart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      }
    }
  }, [])

  // Fetch products for heat scale
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch products')
      })
      .then((data: ApiProduct[]) => {
        const transformed: HeatScaleProduct[] = data
          .sort((a, b) => a.heatNumber - b.heatNumber)
          .map((product) => {
            const styles = getHeatStyles(product.heatLevel, product.heatNumber)
            return {
              id: product.slug || product.id,
              name: product.name,
              heat: product.heatLevel,
              level: product.heatNumber,
              blurb: product.blurb || product.description || '',
              color: styles.color,
              bgColor: styles.bgColor,
              price: product.price,
              scoville: product.scoville || 'N/A',
            }
          })
        setHeatScaleProducts(transformed)
      })
      .catch((err) => {
        console.error('Error fetching products for heat scale:', err)
      })
      .finally(() => {
        setHeatScaleLoading(false)
      })
  }, [])

  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === productId)
      const newCart = existingItem
        ? prev.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { productId, quantity: 1 }]

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('smokhot-cart', JSON.stringify(newCart))

        // Trigger custom event for header update
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      }

      return newCart
    })

    // Trigger animation feedback
    const button = document.querySelector(`[data-product="${productId}"]`)
    if (button) {
      button.classList.add('animate-pulse')
      setTimeout(() => button.classList.remove('animate-pulse'), 300)
    }
  }

  // Fetch tour events
  useEffect(() => {
    fetch('/api/turneja')
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch tour events')
      })
      .then((data: TourEventApi[]) => {
        setTourEvents(data)
      })
      .catch((err) => {
        console.error('Error fetching tour events:', err)
      })
      .finally(() => {
        setTourLoading(false)
      })
  }, [])

  const upcomingTourEvents = tourEvents
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastTourEvents = tourEvents
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Food pairings are editorial content - kept hardcoded
  const foodPairings = [
    { name: "Burger", emoji: "🍔", product: "Fireant Hot" },
    { name: "Roštilj", emoji: "🥩", product: "Jackal Smokin' Hot" },
    { name: "Pizza", emoji: "🍕", product: "Firefly Extra Hot" },
    { name: "Krilca", emoji: "🍗", product: "Fireant Hot" },
    { name: "Tortilje", emoji: "🌯", product: "Gecko Mild" },
    { name: "Pasulj", emoji: "🫘", product: "Gecko Mild" }
  ]

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7] font-sans selection:bg-red-600/70">
      {/* Dotted Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      {/* SEKCIJA 1: INFORMACIJE O BRENDU - HERO */}
      <section className="relative z-10 overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          {/* Hero Content */}
          <div className="flex flex-col justify-center">
            {/* Premium Badge */}
            <div className="mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-[#ffd400]/40 bg-[#ffd400]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#ffd400]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00] shadow-[0_0_18px_rgba(255,106,0,0.8)]" />
              Plaćanje pouzećem širom Srbije
            </div>

            {/* Main Headline */}
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-8xl text-white">
              DOM EGZOTIČNE <span className="text-[#e52421]">LJUTINE</span>
            </h1>

            {/* Brand Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              Domaći mali batch hot sauce brend iz Srbije. Od blagih dimljenih ukusa do brutalnih udara,
              Smokin&apos; Hot spaja craft proizvodnju, opasan karakter i webshop koji prodaje bez smaranja.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center border-2 border-black bg-[#e52421] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:bg-[#ff3d34] hover:shadow-[8px_8px_0_0_#000]"
              >
                Kupi odmah
              </Link>
              <a
                href="#heat-scale"
                className="inline-flex items-center justify-center border-2 border-[#ffd400] bg-transparent px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#ffd400] transition hover:-translate-y-1 hover:bg-[#ffd400] hover:text-black hover:shadow-[6px_6px_0_0_#ffd400]"
              >
                Istraži skalu ljutine
              </a>
            </div>

            {/* Trust Strip */}
            <div className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              Ručno pravljeno · Brza dostava · Pouzeće · Prirodni sastojci
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex min-h-[420px] items-center justify-center">
            {/* Main Container */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/6 to-white/0" />

            {/* Floating Badges */}
            <div className="absolute left-5 top-5 rotate-[-8deg] border-2 border-black bg-[#ffd400] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0_0_#000] transition hover:rotate-[-12deg]">
              Made in Serbia
            </div>
            <div className="absolute bottom-8 right-0 rotate-[8deg] border-2 border-black bg-[#ff6a00] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0_0_#000] transition hover:rotate-[12deg]">
              Small batch fire
            </div>

            {/* Hero Product Image */}
            <div className="relative flex flex-col items-center justify-center p-8">
              <Image
                src="/SmokHotLogo.png"
                alt="SmokHot Collective"
                width={320}
                height={320}
                className="h-auto w-auto object-contain filter drop-shadow-[0_0_40px_rgba(229,36,33,0.4)] transition-transform hover:scale-105"
                priority
              />
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#e52421]/8 blur-[60px] scale-125" />
            </div>
          </div>
        </div>
      </section>

      {/* SEKCIJA 2: SKALA LJUTINE - INTERACTIVE HEAT SCALE */}
      <section id="heat-scale" className="relative z-10 border-y border-white/10 bg-[#111113]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd400]">Izaberi nivo haosa</p>
              <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Skala ljutine</h2>
            </div>
            <p className="max-w-2xl text-white/68">
              Umesto generičnog shopa, Smokin&apos; Hot vodi kupca kroz jasan put: blago, ljuto, ekstra ljuto i totalni napad.
            </p>
          </div>

          {heatScaleLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
                <p className="text-white/60">Učitavanje proizvoda...</p>
              </div>
            </div>
          ) : heatScaleProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/50 text-lg">Proizvodi trenutno nisu dostupni.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-4">
              {heatScaleProducts.map((product, index) => {
                // Progressive visual escalation
                const escalation = [
                  { border: 'border-[rgba(255,183,3,0.2)]', barWidth: 'w-1/4', bg: '', glow: '' },
                  { border: 'border-[rgba(232,93,4,0.3)]', barWidth: 'w-1/2', bg: 'bg-orange-500/[0.03]', glow: '' },
                  { border: 'border-[rgba(204,41,54,0.4)]', barWidth: 'w-3/4', bg: 'bg-red-500/[0.05]', glow: '' },
                  { border: 'border-[rgba(204,41,54,0.7)] border-2', barWidth: 'w-full', bg: 'bg-red-500/[0.08]', glow: 'shadow-[0_0_30px_rgba(229,36,33,0.15)]' },
                ][Math.min(index, 3)]

                return (
                  <div
                    key={product.name}
                    className={`group cursor-pointer rounded-[1.8rem] ${escalation.border} ${escalation.bg} ${escalation.glow} bg-[#0d0d0f] p-6 transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]`}
                    onClick={() => addToCart(product.id)}
                    data-product={product.id}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="text-lg font-black uppercase">0{index + 1}</div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd400]">
                        {product.heat}
                      </div>
                    </div>

                    {/* Heat Progress Bar - progressive width */}
                    <div className="mb-6 h-3 w-full rounded-full bg-white/5">
                      <div className={`h-full ${escalation.barWidth} rounded-full bg-gradient-to-r ${product.color} ${index === 3 ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Product Info */}
                    <h3 className="text-2xl font-black uppercase">{product.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/72">{product.blurb}</p>

                    {/* Scoville Rating */}
                    <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/48">
                      {product.scoville}
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Cena</div>
                        <div className="text-2xl font-black text-[#e52421]">{product.price} RSD</div>
                      </div>
                      <button className="border-2 border-black bg-[#e52421] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] group-hover:bg-[#ff3d34]">
                        <ShoppingBagIcon className="mr-1 inline h-3 w-3" />
                        Dodaj u korpu
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* SEKCIJA 3: TESTIMONIAL "NISMO ZA SVAKOGA" */}
      <section className="relative z-10 bg-[#111113]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          {/* Visual */}
          <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d1d21] to-[#0d0d0f] p-8 flex items-center justify-center">
            <div className="relative">
              <img
                src="/SmokHotLogo.png"
                alt="SmokHot Collective Logo"
                width="280"
                height="280"
                className="h-auto w-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,212,0,0.3)] transition-transform hover:scale-110"
              />
              {/* Subtle glow effect behind logo */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#ffd400]/10 blur-[50px] scale-150" />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd400]">Nismo za svakoga</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-tight sm:text-5xl">
              Domaći sos. Prljav karakter. Čist ukus.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
              Smokin&apos; Hot nije još jedan generičan food shop. Brend treba da deluje kao spoj garažnog benda,
              male craft radionice i ozbiljne ljubavi prema paprici. Vizuelno je glasan, ali UX mora da ostane čist,
              jasan i prodajan.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Pouzeće u Srbiji",
                  text: "Naruči online, plati kada paket stigne. Bez komplikacije, bez čekanja kartica."
                },
                {
                  title: "Mala domaća proizvodnja",
                  text: "Ručno birane paprike, mali batch, fokus na ukus, dim i ozbiljan karakter."
                },
                {
                  title: "Od blagih do brutalnih",
                  text: "Skala ljutine jasno vodi kupca od pitomog dima do čistog napada na nepce."
                }
              ].map((perk) => (
                <div key={perk.title} className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5 transition-all hover:bg-black/40">
                  <h3 className="text-lg font-black uppercase leading-5">{perk.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">{perk.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEKCIJA 5: ŠTA IDE UZ KOJI SOS - FOOD PAIRING */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff6a00]">Rođeni za roštilj</p>
          <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Šta ide uz koji sos?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/68">
            Svaki sos je dizajniran da podigne specifičnu vrstu jela na potpuno novi nivo ukusa.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {foodPairings.map((item, i) => {
            const matchedProduct = heatScaleProducts.find(p => p.name.includes(item.product.split(' ')[0]))
            return (
              <div
                key={item.name}
                className="group cursor-pointer rounded-[1.6rem] border border-white/10 bg-[#111113] p-4 transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                onClick={() => matchedProduct && addToCart(matchedProduct.id)}
              >
                <div className={`mb-4 flex h-40 items-center justify-center rounded-[1.2rem] bg-gradient-to-br ${matchedProduct?.color || 'from-ember-500 to-ember-600'} text-6xl transition-transform group-hover:scale-110`}>
                  {item.emoji}
                </div>
                <h3 className="text-xl font-black uppercase">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Najbolje sa <span className="font-bold text-[#ffd400]">{item.product}</span>
                </p>
                <div className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                  Klikni za dodavanje u korpu
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SEKCIJA 6: TURNEJA - TOUR EVENTS */}
      <section className="relative z-10 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff6a00]">Na putu kroz Srbiju</p>
            <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Turneja</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/68">
              Pratite nasu turneju kroz Srbiju - gde smo palili nepca i gde cemo sledece zapaliti!
            </p>
          </div>

          {tourLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
                <p className="text-white/60">Ucitavanje dogadjaja...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              {/* Upcoming Events */}
              <div className="h-full">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-500 text-xs font-black text-white">
                    {'📅'}
                  </div>
                  <h3 className="text-2xl font-black uppercase text-white">Naredni dogadjaji</h3>
                </div>

                <div className="space-y-4 min-h-[400px]">
                  {upcomingTourEvents.length === 0 ? (
                    <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6 text-center">
                      <p className="text-white/50">Nema zakazanih dogadjaja</p>
                    </div>
                  ) : (
                    upcomingTourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="group rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6 transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-ember-500">
                                {new Date(event.date).toLocaleDateString('sr-RS', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {event.time && (
                                <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                                  {event.time}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xl font-black uppercase text-white group-hover:text-ember-500 transition-colors">
                              {event.title}
                            </h4>
                            <p className="mt-1 text-sm text-white/70">{event.location}</p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ember-500 bg-ember-500/10 transition-all group-hover:bg-ember-500 group-hover:shadow-[0_0_20px_rgba(229,36,33,0.4)]">
                            <span className="text-lg">{'🔥'}</span>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-white/50">
                          {event.description || 'Dodji i probaj nase najnovije sosove uzivo!'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Past Events */}
              <div className="h-full">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-500 text-xs font-black text-black">
                    {'⭐'}
                  </div>
                  <h3 className="text-2xl font-black uppercase text-white">Gde smo palili</h3>
                </div>

                <div className="space-y-4 min-h-[400px]">
                  {pastTourEvents.length === 0 ? (
                    <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-primary-950 to-surface p-6 text-center">
                      <p className="text-white/50">Nema proslih dogadjaja</p>
                    </div>
                  ) : (
                    pastTourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="group rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-primary-950 to-surface p-6 transition-all hover:bg-gradient-to-br hover:from-warning-500/5 hover:to-warning-500/0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="rounded-full border border-warning-500/30 bg-warning-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-warning-500">
                                {new Date(event.date).toLocaleDateString('sr-RS', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="rounded-full border border-mild-500/30 bg-mild-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mild-500">
                                Zavrseno
                              </span>
                            </div>
                            <h4 className="text-xl font-black uppercase text-white">
                              {event.title}
                            </h4>
                            <p className="mt-1 text-sm text-white/70">{event.location}</p>
                            {event.highlight && (
                              <p className="mt-2 text-sm font-bold text-warning-400">{event.highlight}</p>
                            )}
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-warning-500/30 bg-warning-500/10">
                            <span className="text-lg">{'✨'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Centered CTA Button */}
          <div className="mt-8 text-center">
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center border-2 border-ember-500 bg-ember-500 px-8 py-4 text-lg font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
            >
              Pozovi nas za svoj dogadjaj
            </Link>
          </div>

          {/* Tour Stats */}
          <div className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase text-white mb-2">Turneja u brojevima</h3>
              <p className="text-white/70">Nasa putanja kroz Srbiju do sada</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-black text-ember-500 mb-2">15+</div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Dogadjaja</div>
                <div className="text-xs text-white/50 mt-1">Po celoj Srbiji</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-warning-500 mb-2">500+</div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Flasica prodato</div>
                <div className="text-xs text-white/50 mt-1">Uzivo na dogadjajima</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-mild-500 mb-2">8</div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Gradova</div>
                <div className="text-xs text-white/50 mt-1">Beograd, Novi Sad, Kragujevac...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Counter Display */}
      {cartItems.length > 0 && (
        <Link
          href="/korpa"
          className="fixed bottom-6 right-6 z-50 rounded-full border-2 border-black bg-[#e52421] px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
        >
          Korpa: {cartItems.reduce((total, item) => total + item.quantity, 0)} stavki
        </Link>
      )}
    </div>
  )
}
