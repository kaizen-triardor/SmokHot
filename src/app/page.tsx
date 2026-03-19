'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { products, getFeaturedProducts } from '@/data/products'
import { useHomepage, useBrandInfo } from '@/lib/cms'
import { ShoppingBagIcon, PhoneIcon } from '@heroicons/react/24/outline'

interface CartItem {
  productId: string
  quantity: number
}

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const featuredProducts = getFeaturedProducts().slice(0, 4)
  
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

  const heatScaleProducts = [
    {
      id: "gecko-mild",
      name: "Gecko Mild", 
      heat: "Mild",
      level: 1,
      blurb: "Pitom start sa dimom, belim lukom i karakterom.",
      color: "from-mild-500 to-mild-600",
      bgColor: "bg-mild-500",
      price: 590,
      scoville: "1,500 SHU"
    },
    {
      id: "fireant-hot",
      name: "Fireant Hot",
      heat: "Hot", 
      level: 2,
      blurb: "Za burgere, krilca i ekipu koja voli da pecka.",
      color: "from-orange-500 to-orange-600", 
      bgColor: "bg-orange-500",
      price: 640,
      scoville: "8,500 SHU"
    },
    {
      id: "firefly-extra",
      name: "Firefly Extra Hot",
      heat: "Extra Hot",
      level: 3, 
      blurb: "Voćna vatra koja udara brzo i ostaje dugo.",
      color: "from-ember-500 to-ember-600",
      bgColor: "bg-ember-500", 
      price: 720,
      scoville: "25,000 SHU"
    },
    {
      id: "jackal-smokin",
      name: "Jackal Smokin' Hot",
      heat: "Smokin' Hot",
      level: 4,
      blurb: "Brutalan finiš za one koji traže haos, ne sos.", 
      color: "from-fire-500 to-red-700",
      bgColor: "bg-fire-500",
      price: 850,
      scoville: "45,000 SHU"
    }
  ]

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
              Smokin' Hot spaja craft proizvodnju, opasan karakter i webshop koji prodaje bez smaranja.
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

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              {['Ručno pravljeno', 'Brza dostava', 'Pouzeće', 'Prirodni sastojci'].map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                  {tag}
                </span>
              ))}
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

            {/* Product Grid Preview */}
            <div className="relative grid w-full max-w-xl grid-cols-2 gap-4 p-6">
              {heatScaleProducts.map((product, i) => (
                <div
                  key={product.name}
                  className={`group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br ${product.color} p-[1px] shadow-2xl transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${i === 3 ? 'translate-y-6' : i === 1 ? '-translate-y-4' : ''}`}
                >
                  <div className="relative flex h-full min-h-[160px] flex-col justify-between rounded-[1.7rem] bg-[#111113]/92 p-4">
                    <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/75">
                      {product.heat}
                    </div>
                    <div>
                      <div className="mb-3 h-16 w-14 rounded-[1rem] border border-white/10 bg-gradient-to-b from-white/20 to-white/5 shadow-inner" />
                      <h3 className="max-w-[8rem] text-lg font-black uppercase leading-4 text-white">
                        {product.name}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd400]">Level {product.level}</span>
                      <span className="text-sm font-black">{product.price} RSD</span>
                    </div>
                  </div>
                </div>
              ))}
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
              Umesto generičnog shopa, Smokin' Hot vodi kupca kroz jasan put: blago, ljuto, ekstra ljuto i totalni napad.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {heatScaleProducts.map((product, index) => (
              <div 
                key={product.name} 
                className="group cursor-pointer rounded-[1.8rem] border border-white/10 bg-[#0d0d0f] p-6 transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                onClick={() => addToCart(product.id)}
                data-product={product.id}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-lg font-black uppercase">0{index + 1}</div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd400]">
                    {product.heat}
                  </div>
                </div>
                
                {/* Heat Progress Bar */}
                <div className={`mb-6 h-3 w-full rounded-full bg-gradient-to-r ${product.color} shadow-[0_0_15px_rgba(255,106,0,0.3)]`} />
                
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
            ))}
          </div>
        </div>
      </section>

      {/* SEKCIJA 3: FEATURED PROIZVODI */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff6a00]">Najglasniji ukusi</p>
            <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Featured proizvodi</h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex w-fit items-center justify-center border-2 border-black bg-[#ffd400] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#000]"
          >
            Pogledaj celu ponudu
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, i) => {
            const heatProduct = heatScaleProducts.find(hp => hp.name.includes(product.name.split(' ')[0]))
            return (
              <div 
                key={product.name} 
                className="group overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#111113] transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className={`relative flex h-64 items-center justify-center bg-gradient-to-br ${heatProduct?.color || 'from-ember-500 to-ember-600'}`}>
                  <div className="absolute left-4 top-4 border border-black bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ffd400]">
                    Best seller #{i + 1}
                  </div>
                  <div className="h-40 w-28 rounded-[1.4rem] border border-black/20 bg-black/20 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black uppercase leading-6">{product.name}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                      Level {product.heatLevel}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-white/70">{product.blurb}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Od</div>
                      <div className="text-2xl font-black text-[#e52421]">{product.price} RSD</div>
                    </div>
                    <button 
                      onClick={() => addToCart(product.slug)}
                      className="border-2 border-black bg-[#e52421] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 hover:bg-[#ff3d34] hover:shadow-[6px_6px_0_0_#000]"
                    >
                      Dodaj u korpu
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SEKCIJA 4: TESTIMONIAL "NISMO ZA SVAKOGA" */}
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
              Smokin' Hot nije još jedan generičan food shop. Brend treba da deluje kao spoj garažnog benda,
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
              Pratite našu turneju kroz Srbiju - gde smo palili nepca i gde ćemo sledeće zapaliti!
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Upcoming Events */}
            <div className="h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-500 text-xs font-black text-white">
                  📅
                </div>
                <h3 className="text-2xl font-black uppercase text-white">Naredni događaji</h3>
              </div>

              <div className="space-y-4 min-h-[400px]">
                {[
                  {
                    date: "25 Mar 2026",
                    event: "Beogradska pijaca",
                    location: "Kalenić pijaca, Beograd", 
                    time: "09:00 - 15:00",
                    status: "upcoming"
                  },
                  {
                    date: "02 Apr 2026", 
                    event: "Food Fest Novi Sad",
                    location: "Dunavski park, Novi Sad",
                    time: "12:00 - 22:00", 
                    status: "upcoming"
                  },
                  {
                    date: "15 Apr 2026",
                    event: "Kragujevac gastro festival",
                    location: "Trg slobode, Kragujevac",
                    time: "10:00 - 20:00",
                    status: "upcoming"
                  }
                ].map((event, index) => (
                  <div
                    key={index}
                    className="group rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-6 transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-ember-500">
                            {event.date}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                            {event.time}
                          </span>
                        </div>
                        <h4 className="text-xl font-black uppercase text-white group-hover:text-ember-500 transition-colors">
                          {event.event}
                        </h4>
                        <p className="mt-1 text-sm text-white/70">{event.location}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ember-500 bg-ember-500/10 transition-all group-hover:bg-ember-500 group-hover:shadow-[0_0_20px_rgba(229,36,33,0.4)]">
                        <span className="text-lg">🔥</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-white/50">
                      Dođi i probaj naše najnovije sosove uživo!
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Events */}
            <div className="h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-500 text-xs font-black text-black">
                  ⭐
                </div>
                <h3 className="text-2xl font-black uppercase text-white">Gde smo palili</h3>
              </div>

              <div className="space-y-4 min-h-[400px]">
                {[
                  {
                    date: "10 Mar 2026",
                    event: "Zemun food market", 
                    location: "Gardoš, Zemun",
                    highlight: "Prodali smo 50+ flašica za 4 sata!",
                    status: "past"
                  },
                  {
                    date: "28 Feb 2026",
                    event: "Craft beer fest",
                    location: "Dorćol, Beograd", 
                    highlight: "Jackal sos bio hit sa craft pivom",
                    status: "past"
                  },
                  {
                    date: "14 Feb 2026",
                    event: "Valentine's spicy dinner",
                    location: "Restoran Ambar, Beograd",
                    highlight: "Gecko mild bio perfektan za romantičnu večeru",
                    status: "past"
                  }
                ].map((event, index) => (
                  <div
                    key={index}
                    className="group rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-primary-950 to-surface p-6 transition-all hover:bg-gradient-to-br hover:from-warning-500/5 hover:to-warning-500/0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="rounded-full border border-warning-500/30 bg-warning-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-warning-500">
                            {event.date}
                          </span>
                          <span className="rounded-full border border-mild-500/30 bg-mild-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mild-500">
                            Završeno
                          </span>
                        </div>
                        <h4 className="text-xl font-black uppercase text-white">
                          {event.event}
                        </h4>
                        <p className="mt-1 text-sm text-white/70">{event.location}</p>
                        <p className="mt-2 text-sm font-bold text-warning-400">{event.highlight}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-warning-500/30 bg-warning-500/10">
                        <span className="text-lg">✨</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centered CTA Button */}
          <div className="mt-8 text-center">
            <Link
              href="/kontakt" 
              className="inline-flex items-center justify-center border-2 border-ember-500 bg-ember-500 px-8 py-4 text-lg font-black uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
            >
              Pozovi nas za svoj događaj
            </Link>
          </div>

          {/* Tour Stats */}
          <div className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase text-white mb-2">Turneja u brojevima</h3>
              <p className="text-white/70">Naša putanja kroz Srbiju do sada</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-black text-ember-500 mb-2">15+</div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Događaja</div>
                <div className="text-xs text-white/50 mt-1">Po celoj Srbiji</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-warning-500 mb-2">500+</div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Flašica prodato</div>
                <div className="text-xs text-white/50 mt-1">Uživo na događajima</div>
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

      {/* SEKCIJA 7: KONTAKT - SOCIAL LINKS */}
      <section className="relative z-10 overflow-hidden border-t border-white/10 bg-[#111113]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.18),transparent_25%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd400]">Ostani u kontaktu</p>
            <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Pitanja? Tu smo!</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/72">
              Imao pitanja o našim sosovima? Trebao preporuku? Kontaktiramo nas preko telefona ili društvenih mreža.
            </p>
          </div>

          {/* Contact Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Phone */}
            <a
              href="tel:+381601234567"
              className="group rounded-[1.8rem] border border-white/10 bg-[#0b0b0d] p-6 text-center transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full border-2 border-[#e52421] bg-[#e52421]/10 p-4 transition-all group-hover:bg-[#e52421] group-hover:shadow-[0_0_25px_rgba(229,36,33,0.5)]">
                  <PhoneIcon className="h-8 w-8 text-[#e52421] transition-colors group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase">Telefon</h3>
              <p className="mt-2 text-sm text-white/70">+381 60 123 4567</p>
              <p className="mt-1 text-xs text-white/50">Pon-Pet: 9:00-17:00</p>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/smokinhot.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-[1.8rem] border border-white/10 bg-[#0b0b0d] p-6 text-center transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full border-2 border-[#ffd400] bg-[#ffd400]/10 p-4 transition-all group-hover:bg-[#ffd400] group-hover:shadow-[0_0_25px_rgba(255,212,0,0.5)]">
                  <svg className="h-8 w-8 text-[#ffd400] transition-colors group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-black uppercase">Instagram</h3>
              <p className="mt-2 text-sm text-white/70">@smokinhot.rs</p>
              <p className="mt-1 text-xs text-white/50">Dnevno sos content</p>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/smokinhot.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-[1.8rem] border border-white/10 bg-[#0b0b0d] p-6 text-center transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full border-2 border-[#ff6a00] bg-[#ff6a00]/10 p-4 transition-all group-hover:bg-[#ff6a00] group-hover:shadow-[0_0_25px_rgba(255,106,0,0.5)]">
                  <svg className="h-8 w-8 text-[#ff6a00] transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-black uppercase">Facebook</h3>
              <p className="mt-2 text-sm text-white/70">Smokin' Hot</p>
              <p className="mt-1 text-xs text-white/50">Recepti i tips</p>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@smokinhot.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-[1.8rem] border border-white/10 bg-[#0b0b0d] p-6 text-center transition-all hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full border-2 border-[#98b83c] bg-[#98b83c]/10 p-4 transition-all group-hover:bg-[#98b83c] group-hover:shadow-[0_0_25px_rgba(152,184,60,0.5)]">
                  <svg className="h-8 w-8 text-[#98b83c] transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-black uppercase">TikTok</h3>
              <p className="mt-2 text-sm text-white/70">@smokinhot.rs</p>
              <p className="mt-1 text-xs text-white/50">Ljuti sos izazovi</p>
            </a>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="mb-6 text-lg text-white/70">
              Za bilo koje pitanje o sosovima, preporukama ili dostavi - kontaktiraj nas!
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center border-2 border-black bg-[#e52421] px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:bg-[#ff3d34] hover:shadow-[8px_8px_0_0_#000]"
            >
              Kompletan kontakt
            </Link>
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