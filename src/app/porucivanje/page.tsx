'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CartItem {
  productId: string
  quantity: number
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  note: string
}

export default function PorucivanjePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    note: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Delivery cost settings
  const DELIVERY_COST = 300 // RSD
  const FREE_DELIVERY_THRESHOLD = 3000 // RSD

  useEffect(() => {
    const savedCart = localStorage.getItem('smokhot-cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }

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

  const getProductDetails = (productId: string) => {
    return products.find(p => p.slug === productId || p.id === productId)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductDetails(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Ime je obavezno'
        if (value.trim().length < 2) return 'Ime mora imati najmanje 2 karaktera'
        if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(value)) return 'Ime može sadržavati samo slova'
        return ''

      case 'lastName':
        if (!value.trim()) return 'Prezime je obavezno'
        if (value.trim().length < 2) return 'Prezime mora imati najmanje 2 karaktera'
        if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(value)) return 'Prezime može sadržavati samo slova'
        return ''

      case 'email':
        if (!value.trim()) return 'Email je obavezan'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Email adresa nije ispravna'
        return ''

      case 'phone':
        if (!value.trim()) return 'Telefon je obavezan'
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Telefon nije u ispravnom formatu'
        return ''

      case 'address':
        if (!value.trim()) return 'Adresa je obavezna'
        if (value.trim().length < 5) return 'Adresa mora imati najmanje 5 karaktera'
        return ''

      case 'city':
        if (!value.trim()) return 'Grad je obavezan'
        if (value.trim().length < 2) return 'Grad mora imati najmanje 2 karaktera'
        if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s\-]+$/.test(value)) return 'Grad može sadržavati samo slova'
        return ''

      case 'postalCode':
        if (!value.trim()) return 'Poštanski broj je obavezan'
        if (!/^[0-9]{5}$/.test(value.trim())) return 'Poštanski broj mora imati 5 cifara'
        return ''

      default:
        return ''
    }
  }

  const validateAllFields = (): boolean => {
    const errors: {[key: string]: string} = {}

    Object.entries(customerInfo).forEach(([key, value]) => {
      if (key !== 'note') { // Note is optional
        const error = validateField(key, value)
        if (error) errors[key] = error
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const sendOrderEmail = async (orderData: any) => {
    const emailContent = `
Smokin' Hot - Nova Porudžbina #${orderData.orderNumber}

PODACI O KUPCU:
Ime i prezime: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.email}
Telefon: ${orderData.customer.phone}
Adresa: ${orderData.customer.address}
Grad: ${orderData.customer.city}
Poštanski broj: ${orderData.customer.postalCode}
${orderData.customer.note ? `Napomena: ${orderData.customer.note}` : ''}

PORUČENI PROIZVODI:
${orderData.items.map((item: any) =>
  `- ${item.product.name} x ${item.quantity} = ${(item.product.price * item.quantity).toLocaleString()} RSD`
).join('\n')}

UKUPNO: ${orderData.total.toLocaleString()} RSD + dostava

Datum porudžbine: ${new Date().toLocaleString('sr-RS')}
Način plaćanja: Pouzeće (poštar)
    `.trim();

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_ORDER_EMAIL || 'info@smokhot.rs',
          subject: `Smokin' Hot - Nova Porudžbina #${orderData.orderNumber}`,
          body: emailContent
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Email sent successfully:', result.data)
      } else {
        console.error('❌ Email sending failed:', result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Email API call failed:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate all fields
    if (!validateAllFields()) {
      setIsSubmitting(false)
      return
    }

    try {
      // Generate order number
      const orderNumber = 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

      // Prepare order data
      const orderData = {
        orderNumber,
        customer: customerInfo,
        items: cartItems.map(item => ({
          ...item,
          product: getProductDetails(item.productId)
        })).filter(item => item.product),
        total: calculateTotal(),
        timestamp: new Date().toISOString()
      }

      // Send order email
      await sendOrderEmail(orderData)

      // Save order to database
      const subtotal = calculateTotal()
      const shippingCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            customerPhone: customerInfo.phone,
            customerAddress: `${customerInfo.address}, ${customerInfo.postalCode} ${customerInfo.city}`,
            notes: customerInfo.note || null,
            items: orderData.items.map((item: any) => ({
              productId: item.productId,
              name: item.product?.name,
              price: item.product?.price,
              quantity: item.quantity,
            })),
            totalAmount: subtotal + shippingCost,
            shippingCost,
          }),
        })
      } catch (dbError) {
        // Don't block the order if DB save fails - email was already sent
        console.error('Failed to save order to database:', dbError)
      }

      // Clear cart and show success
      localStorage.removeItem('smokhot-cart')
      setOrderSubmitted(true)
      localStorage.setItem('last-order', orderNumber)

      // Show success message
      console.log('Order created successfully:', orderNumber)

    } catch (error) {
      console.error('❌ Order submission failed:', error)
      alert('Greška pri slanju porudžbine na email. Molimo pokušajte ponovo ili kontaktirajte direktno +381 60 123 4567.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7] flex items-center justify-center">
        <p className="text-lg text-white/70">Učitavanje...</p>
      </div>
    )
  }

  if (cartItems.length === 0 && !orderSubmitted) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
        <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-black uppercase text-white">Korpa je prazna</h1>
            <p className="mb-8 text-white/70">Dodaj sosove u korpu pre poručivanja</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center border-2 border-fire-500 bg-fire-500 px-8 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1"
            >
              Idi u shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderSubmitted) {
    const orderNumber = localStorage.getItem('last-order') || 'SH-123456'

    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
        <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full border-4 border-mild-500 bg-mild-500/20 p-6">
                <svg className="h-16 w-16 text-mild-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-black uppercase text-white">Porudžbina poslata!</h1>
            <p className="mb-6 text-lg text-white/70">
              Tvoja porudžbina je uspešno primljena. Dobićeš SMS potvrdu sa detaljima dostave.
            </p>

            <div className="mb-8 rounded-2xl border border-warning-400/20 bg-warning-400/10 p-6">
              <div className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-warning-400">
                Broj porudžbine
              </div>
              <div className="text-2xl font-black text-white">{orderNumber}</div>
            </div>

            <div className="mb-8 space-y-4 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>📦 Pakovanje:</span>
                <span>24-48h</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🚚 Dostava:</span>
                <span>1-3 radna dana</span>
              </div>
              <div className="flex items-center justify-between">
                <span>💰 Plaćanje:</span>
                <span>Pouzeće (poštar)</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/"
                className="flex-1 rounded-xl border-2 border-fire-500 bg-fire-500 py-3 text-center font-bold uppercase tracking-[0.15em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1"
              >
                Početna
              </Link>
              <Link
                href="/shop"
                className="flex-1 rounded-xl border-2 border-white/20 py-3 text-center font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
              >
                Nastavi kupovinu
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Header */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
                Plaćanje pouzećem
              </p>
              <h1 className="text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
                Poručivanje
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                Unesi svoje podatke i naruči sosove. Platiš tek kada paket stigne na vrata.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
              {/* Order Form */}
              <div>
                <h2 className="mb-8 text-2xl font-bold text-white">Podaci za dostavu</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Ime *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={customerInfo.firstName}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.firstName
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="Marko"
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Prezime *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={customerInfo.lastName}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.lastName
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="Petrović"
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.email
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="marko@primer.com"
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Telefon *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.phone
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="060 123 4567"
                      />
                      {validationErrors.phone && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Adresa *</label>
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      required
                      className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                        validationErrors.address
                          ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                          : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                      }`}
                      placeholder="Bulevar Oslobođenja 123"
                    />
                    {validationErrors.address && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors.address}</p>
                    )}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Grad *</label>
                      <input
                        type="text"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.city
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="Beograd"
                      />
                      {validationErrors.city && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">Poštanski broj *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={customerInfo.postalCode}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                          validationErrors.postalCode
                            ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                            : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
                        }`}
                        placeholder="11000"
                      />
                      {validationErrors.postalCode && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Napomena</label>
                    <textarea
                      name="note"
                      value={customerInfo.note}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                      placeholder="Dodatne instrukcije za dostavu..."
                    />
                  </div>

                  {/* COD Info */}
                  <div className="rounded-xl border border-warning-400/20 bg-warning-400/5 p-6">
                    <h3 className="mb-3 font-bold text-warning-400">Plaćanje pouzećem</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• Platiš tek kada ti poštar dostavi paket</li>
                      <li>• Možeš da proveriš sadržaj pre plaćanja</li>
                      <li>• Nema dodatnih troškova ili skrivenih naknada</li>
                      <li>• Dostava 1-3 radna dana širom Srbije</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border-2 border-fire-500 bg-fire-500 py-4 text-lg font-bold uppercase tracking-[0.15em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Šalje se...' : 'Potvrdi porudžbinu'}
                  </button>
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <div className="sticky top-24">
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-primary-950 p-8">
                    <h3 className="mb-6 text-2xl font-bold text-white">Tvoja porudžbina</h3>

                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const product = getProductDetails(item.productId)
                        if (!product) return null

                        return (
                          <div key={item.productId} className="flex justify-between border-b border-white/10 pb-4">
                            <div>
                              <h4 className="font-bold text-white">{product.name}</h4>
                              <p className="text-sm text-white/60">
                                {item.quantity}x @ {product.price} RSD
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white">
                                {(product.price * item.quantity).toLocaleString()} RSD
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-6">
                      <div className="mb-2 flex justify-between text-sm text-white/70">
                        <span>Ukupno proizvodi:</span>
                        <span>{calculateTotal().toLocaleString()} RSD</span>
                      </div>
                      <div className="mb-2 flex justify-between text-sm text-white/70">
                        <span>+ Dostava:</span>
                        <span>
                          {calculateTotal() >= FREE_DELIVERY_THRESHOLD
                            ? <span className="text-mild-500 font-bold">Besplatna</span>
                            : `${DELIVERY_COST} RSD`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-white">Ukupno:</span>
                        <span className="text-ember-500">
                          {(calculateTotal() + (calculateTotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST)).toLocaleString()} RSD
                        </span>
                      </div>
                      {calculateTotal() < FREE_DELIVERY_THRESHOLD && (
                        <p className="mt-2 text-xs text-mild-500">
                          Dodaj još {(FREE_DELIVERY_THRESHOLD - calculateTotal()).toLocaleString()} RSD za besplatnu dostavu!
                        </p>
                      )}
                      <p className="mt-2 text-xs text-white/50">
                        Plaćanje pouzećem - bez troškova unapred
                      </p>
                    </div>
                  </div>

                  {/* Back to Cart */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/korpa"
                      className="text-sm font-bold uppercase tracking-[0.1em] text-white/60 transition hover:text-white"
                    >
                      ← Vrati se u korpu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
