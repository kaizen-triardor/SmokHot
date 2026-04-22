'use client'

import React, { useState } from 'react'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  UserIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline'

type EntityType = 'individual' | 'business'

interface ContactForm {
  entityType: EntityType
  companyName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  queryType: string
  message: string
}

export default function KontaktPage() {
  const [form, setForm] = useState<ContactForm>({
    entityType: 'individual',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    queryType: '',
    message: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isBusiness = form.entityType === 'business'

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactForm, string>> = {}

    if (isBusiness && (!form.companyName.trim() || form.companyName.trim().length < 2)) {
      newErrors.companyName = 'Naziv firme je obavezan (min 2 karaktera)'
    }
    if (!form.firstName.trim() || form.firstName.trim().length < 2) {
      newErrors.firstName = 'Ime je obavezno (min 2 karaktera)'
    }
    if (!form.lastName.trim() || form.lastName.trim().length < 2) {
      newErrors.lastName = 'Prezime je obavezno (min 2 karaktera)'
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Unesite ispravnu email adresu'
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = 'Poruka je obavezna (min 10 karaktera)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const setEntityType = (entityType: EntityType) => {
    setForm((prev) => ({ ...prev, entityType }))
    setErrors((prev) => ({ ...prev, companyName: '' }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const entityLabel = isBusiness ? 'PRAVNO LICE' : 'FIZIČKO LICE'
      const companyLine = isBusiness ? `\nFirma: ${form.companyName}` : ''
      const subject = isBusiness
        ? `[B2B] ${form.companyName} — ${form.queryType || 'Partnerstvo / upit'}`
        : `Kontakt forma: ${form.queryType || 'Opšte pitanje'} - ${form.firstName} ${form.lastName}`

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body:
            `Tip: ${entityLabel}${companyLine}\n` +
            `Kontakt osoba: ${form.firstName} ${form.lastName}\n` +
            `Email: ${form.email}\n` +
            `Telefon: ${form.phone || 'Nije uneto'}\n` +
            `Tip upita: ${form.queryType || 'Nije izabrano'}\n\n` +
            `Poruka:\n${form.message}`,
        }),
      })
      setSubmitted(true)
    } catch {
      alert('Greška pri slanju poruke. Pokušajte ponovo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (field: keyof ContactForm) =>
    `w-full rounded-xl border px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
        : 'border-white/20 bg-primary-950/50 focus:border-ember-500 focus:ring-ember-500/20'
    }`

  const entityQueryOptions = isBusiness
    ? [
        { value: 'partnership', label: 'Partnerstvo / distribucija' },
        { value: 'horeca', label: 'HoReCa (restoran, hotel, bar, kafana)' },
        { value: 'bulk', label: 'Veleprodaja / velika količina' },
        { value: 'private-label', label: 'Private label / brendiranje' },
        { value: 'event', label: 'Saradnja na događaju' },
        { value: 'other', label: 'Ostalo' },
      ]
    : [
        { value: 'order', label: 'Pitanje o narudžbini' },
        { value: 'product', label: 'Informacije o proizvodu' },
        { value: 'delivery', label: 'Dostava i plaćanje' },
        { value: 'feedback', label: 'Povratne informacije' },
        { value: 'other', label: 'Ostalo' },
      ]

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Dotted Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
                Povežimo se
              </p>
              <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
                Kontakt
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-white/80 leading-relaxed">
                Pitanja, predlozi, pohvale ili žalbe - sve je dobrodošlo.
                Odgovaramo brzo kao što naši sosovi pecaju.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2">
              {/* Contact Information */}
              <div>
                <h2 className="mb-8 text-3xl font-bold text-white">
                  Kako da nas dosegneš
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-ember-500/10 p-3">
                      <EnvelopeIcon className="h-6 w-6 text-ember-500" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-white">Email</h3>
                      <p className="text-white/70">
                        <a href="mailto:smokinhotcollective@gmail.com" className="transition hover:text-white">
                          smokinhotcollective@gmail.com
                        </a>
                      </p>
                      <p className="text-sm text-white/50">Odgovaramo u roku od 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-warning-500/10 p-3">
                      <PhoneIcon className="h-6 w-6 text-warning-500" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-white">Telefon</h3>
                      <p className="text-white/70">
                        <a href="tel:+381636445599" className="transition hover:text-white">
                          +381 63 644 599
                        </a>
                      </p>
                      <p className="text-sm text-white/50">Poziv / Viber / WhatsApp</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-mild-500/10 p-3">
                      <MapPinIcon className="h-6 w-6 text-mild-500" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-white">Adresa</h3>
                      <p className="text-white/70">
                        Srednjokrajska 23D, Barajevo<br />
                        11000 Beograd, Srbija
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-fire-500/10 p-3">
                      <ClockIcon className="h-6 w-6 text-fire-500" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-white">Radno vreme</h3>
                      <div className="space-y-1 text-white/70">
                        <p>Non-stop, 7 dana u nedelji</p>
                        <p className="text-xs text-white/50">Online narudžbine 24 / 7 — dostava u radne dane</p>
                      </div>
                    </div>
                  </div>

                  {/* Social links row */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href="https://www.instagram.com/smokhot/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://www.facebook.com/smokhot/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://www.tiktok.com/@smokhot011"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                    >
                      TikTok
                    </a>
                    <a
                      href="https://www.linkedin.com/company/71262668"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="rounded-3xl border border-white/10 bg-surface p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-mild-500 bg-mild-500/20">
                      <svg className="h-10 w-10 text-mild-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="mb-4 text-3xl font-black uppercase text-white">Poruka poslata!</h2>
                    <p className="mb-8 text-white/70">
                      Hvala na poruci. Odgovorićemo vam u najkraćem roku.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setForm({ firstName: '', lastName: '', email: '', phone: '', queryType: '', message: '' })
                      }}
                      className="border-2 border-white/20 px-6 py-3 font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/5"
                    >
                      Pošalji novu poruku
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-6 text-2xl font-bold text-white">
                      Pošaljite poruku
                    </h2>

                    {/* Entity-type toggle: Individual vs Business */}
                    <div className="mb-6">
                      <span className="mb-2 block text-sm font-bold text-white">
                        Pišete kao
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Tip pošiljaoca"
                        className="grid grid-cols-2 gap-2 rounded-xl border border-white/15 bg-black/30 p-1"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={!isBusiness}
                          onClick={() => setEntityType('individual')}
                          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition ${
                            !isBusiness
                              ? 'bg-fire-500 text-white shadow-[0_4px_14px_-4px_rgba(229,36,33,0.5)]'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <UserIcon className="h-4 w-4" />
                          Fizičko lice
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isBusiness}
                          onClick={() => setEntityType('business')}
                          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition ${
                            isBusiness
                              ? 'bg-fire-500 text-white shadow-[0_4px_14px_-4px_rgba(229,36,33,0.5)]'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <BuildingOffice2Icon className="h-4 w-4" />
                          Pravno lice
                        </button>
                      </div>
                    </div>

                    {/* B2B partnership banner — shown only when Pravno lice is selected */}
                    {isBusiness && (
                      <div className="mb-6 overflow-hidden rounded-2xl border border-warning-400/30 bg-gradient-to-br from-warning-400/10 to-fire-500/10 p-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-warning-400/20">
                            <HandRaisedIcon className="h-5 w-5 text-warning-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-black uppercase tracking-[0.08em] text-warning-400">
                              Specijalna ponuda za firme
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-white/80">
                              Nudimo <strong className="text-white">posebne uslove saradnje</strong> za
                              restorane, hotele, barove, kafane i druge ugostiteljske objekte —
                              kao i za maloprodajne lance i distributere. Veleprodajne cene, private-label
                              opcije, co-branding i saradnja na događajima su sve na stolu.
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/70">
                              Popunite formu dole — odgovorićemo sa detaljima i dogovoriti
                              <strong className="text-warning-300"> personalizovanu ponudu</strong> za
                              vašu firmu u roku od 24–48 sati.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Company name — only when Pravno lice */}
                      {isBusiness && (
                        <div>
                          <label htmlFor="companyName" className="mb-2 block text-sm font-bold text-white">
                            Naziv firme *
                          </label>
                          <input
                            id="companyName"
                            type="text"
                            name="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            className={inputClass('companyName')}
                            placeholder="npr. Smokin' Hot d.o.o."
                          />
                          {errors.companyName && (
                            <p className="mt-1 text-xs text-red-400">{errors.companyName}</p>
                          )}
                        </div>
                      )}

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-white">
                            {isBusiness ? 'Ime kontakt osobe *' : 'Ime *'}
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className={inputClass('firstName')}
                            placeholder="Vaše ime"
                          />
                          {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-white">
                            {isBusiness ? 'Prezime kontakt osobe *' : 'Prezime *'}
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className={inputClass('lastName')}
                            placeholder="Vaše prezime"
                          />
                          {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-bold text-white">Email *</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass('email')}
                          placeholder="vas.email@primer.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-bold text-white">Telefon</label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className={inputClass('phone')}
                          placeholder="+381 60 123 4567"
                        />
                      </div>

                      <div>
                        <label htmlFor="queryType" className="mb-2 block text-sm font-bold text-white">Tip upita</label>
                        <select
                          id="queryType"
                          name="queryType"
                          value={form.queryType}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-fire-500 focus:outline-none focus:ring-2 focus:ring-fire-500/20"
                        >
                          <option value="">Izaberite tip upita</option>
                          {entityQueryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="mb-2 block text-sm font-bold text-white">Poruka *</label>
                        <textarea
                          id="message"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={5}
                          className={inputClass('message')}
                          placeholder={
                            isBusiness
                              ? 'Opišite vaš biznis i potrebe: tip objekta, količine, lokacija, preferirani uslovi…'
                              : 'Kako možemo da vam pomognemo?'
                          }
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full border-2 border-fire-500 bg-fire-500 px-6 py-4 font-bold uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Šalje se...' : 'Pošaljite poruku'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Često postavljana pitanja
              </h2>
              <p className="text-white/70">
                Odgovori na najčešća pitanja o našim sosovima i uslugama
              </p>
            </div>

            <div className="grid gap-6 md:gap-8">
              {[
                {
                  question: 'Kako funkcioniše plaćanje pouzećem?',
                  answer: 'Naručujete online, a plaćate tek kada poštar donese paket na vašu adresu. Možete da proverite paket pre plaćanja. Nema skrivenih troškova ili dodatnih naknada.'
                },
                {
                  question: 'Koliko dugo traje dostava?',
                  answer: 'Standardna dostava traje 1-3 radna dana za celu Srbiju. Za Beograd i Novi Sad dostava je obično sledećeg dana.'
                },
                {
                  question: 'Kakav je rok trajanja sosova?',
                  answer: 'Svi naši sosovi imaju rok trajanja od 12 meseci od datuma proizvodnje. Preporučujemo čuvanje na hladnom i suvom mestu.'
                },
                {
                  question: 'Da li mogu da vratim proizvod?',
                  answer: 'Apsolutno! Ako niste zadovoljni kvalitetom, možete vratiti neotvoren proizvod u roku od 14 dana.'
                },
                {
                  question: 'Da li pravite custom sosove?',
                  answer: 'Za veće količine (50+ flašica) možemo da napravimo custom blend po vašim specifikacijama. Kontaktirajte nas za više informacija.'
                },
                {
                  question: 'Gde se proizvode sosovi?',
                  answer: 'Svi sosovi se ručno prave u našoj licenciranoj kuhinji u Beogradu. Koristimo isključivo lokalne i uvozne premium sastojke.'
                }
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-xl border border-white/10 bg-primary-950/50 p-6"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-bold text-white group-open:text-ember-500">
                    <span className="flex items-center gap-3">
                      <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <span className="text-2xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-4 pl-8 text-white/70">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Info */}
        <section className="border-t border-white/8 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Dostava i plaćanje
              </h2>
              <p className="text-white/70">
                Sve informacije o dostavi i opcijama plaćanja
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full border border-ember-500/30 bg-ember-500/10 p-4">
                    <TruckIcon className="h-8 w-8 text-ember-500" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">Brza dostava</h3>
                <p className="text-white/70">
                  1-3 radna dana za celu Srbiju. Beograd i Novi Sad sledećeg dana.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full border border-warning-500/30 bg-warning-500/10 p-4">
                    <svg className="h-8 w-8 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h4a2 2 0 002-2v-2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">Plaćanje pouzećem</h3>
                <p className="text-white/70">
                  Plaćate tek kada primate paket. Nema rizika, nema čekanja.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full border border-mild-500/30 bg-mild-500/10 p-4">
                    <ShieldCheckIcon className="h-8 w-8 text-mild-500" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">Garancija kvaliteta</h3>
                <p className="text-white/70">
                  Povraćaj novca u roku od 14 dana ako niste zadovoljni.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
