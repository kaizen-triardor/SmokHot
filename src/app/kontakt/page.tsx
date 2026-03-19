'use client'

import React from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function KontaktPage() {
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
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-ember-500/10 p-3">
                    <EnvelopeIcon className="h-6 w-6 text-ember-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">Email</h3>
                    <p className="text-white/70">info@smokinhot.rs</p>
                    <p className="text-sm text-white/50">Odgovaramo u roku od 24h</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-warning-500/10 p-3">
                    <PhoneIcon className="h-6 w-6 text-warning-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">Telefon</h3>
                    <p className="text-white/70">+381 60 123 4567</p>
                    <p className="text-sm text-white/50">Ponedeljak - Petak: 9:00 - 17:00</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-mild-500/10 p-3">
                    <MapPinIcon className="h-6 w-6 text-mild-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">Adresa</h3>
                    <p className="text-white/70">
                      Bulevar Oslobođenja 123<br />
                      11000 Beograd, Srbija
                    </p>
                    <p className="text-sm text-white/50">Ponedeljak - Petak: 10:00 - 18:00</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-fire-500/10 p-3">
                    <ClockIcon className="h-6 w-6 text-fire-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-white">Radno vreme</h3>
                    <div className="space-y-1 text-white/70">
                      <p>Ponedeljak - Petak: 9:00 - 17:00</p>
                      <p>Subota: 10:00 - 15:00</p>
                      <p>Nedelja: Zatvoreno</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-3xl border border-white/10 bg-surface p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Pošaljite poruku
              </h2>

              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Ime *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                      placeholder="Vaše ime"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Prezime *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                      placeholder="Vaše prezime"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                    placeholder="vas.email@primer.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                    placeholder="+381 60 123 4567"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Tip upita
                  </label>
                  <select className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20">
                    <option value="">Izaberite tip upita</option>
                    <option value="order">Pitanje o narudžbini</option>
                    <option value="product">Informacije o proizvodu</option>
                    <option value="delivery">Dostava i plaćanje</option>
                    <option value="feedback">Povratne informacije</option>
                    <option value="other">Ostalo</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Poruka *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                    placeholder="Kako možemo da vam pomognemo?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full border-2 border-ember-500 bg-ember-500 px-6 py-4 font-bold uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-2 focus:ring-offset-primary-950"
                >
                  Pošaljite poruku
                </button>
              </form>
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
                answer: 'Standardna dostava traje 1-3 radna dana za cele Srbiju. Za Beograd i Novi Sad dostava je obično sledećeg dana. Pošaljićemo vam SMS sa brojem za praćenje.'
              },
              {
                question: 'Kakav je rok trajanja sosova?',
                answer: 'Svi naši sosovi imaju rok trajanja od 12 meseci od datuma proizvodnje. Preporučujemo čuvanje na hladnom i suvom mestu, bez potrebe za frižiderom pre otvaranja.'
              },
              {
                question: 'Da li mogu da vratim proizvod?',
                answer: 'Apsolutno! Ako niste zadovoljni kvalitetom, možete vratiti neotvoren proizvod u roku od 14 dana. Kontaktirajte nas i mi ćemo organizovati povraćaj.'
              },
              {
                question: 'Da li pravite custom sosove?',
                answer: 'Za veće količine (50+ flašica) možemo da napravimo custom blend po vašim specifikacijama. Kontaktirajte nas za više informacija o cenama i rokovima.'
              },
              {
                question: 'Gde se proizvode sosovi?',
                answer: 'Svi sosovi se ručno prave u našoj licenciranoj kuhinji u Beogradu. Koristimo isključivo lokalne i uvozne premium sastojke, bez konzervansa i veštačkih aditiva.'
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