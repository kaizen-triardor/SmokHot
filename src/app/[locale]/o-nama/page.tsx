'use client'

import React from 'react'
import { FireIcon, HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import LogoCarousel from '@/components/ui/LogoCarousel'

export default function ONamaPage() {
  // Carousel slides - početak sa 3 iste slike (logo)
  const logoSlides = [
    {
      id: 1,
      src: '/SmokHotLogo.png',
      alt: 'SmokHot Collective Logo - Prva slika',
      title: 'Smokin\' Hot Collective'
    },
    {
      id: 2,
      src: '/SmokHotLogo.png',
      alt: 'SmokHot Collective Logo - Druga slika',
      title: 'Srpski Ljuti Sosovi'
    },
    {
      id: 3,
      src: '/SmokHotLogo.png',
      alt: 'SmokHot Collective Logo - Treća slika',
      title: 'Rock & Roll Kitchen'
    }
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
              Priča o vatri
            </p>
            <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
              O Nama
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-white/80 leading-relaxed">
              Mi smo buntovnici koji su zapalili revoluciju ukusa u Srbiji. 
              Svaki sos je pokret otpora protiv bljutavih jela.
            </p>
          </div>
        </div>
      </section>

        {/* Story Section */}
        <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Image */}
            <div className="relative group">
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d1d21] to-[#0d0d0f] p-8 flex items-center justify-center">
                <LogoCarousel 
                  slides={logoSlides}
                  autoPlayInterval={4000}
                  className="min-h-[320px] flex items-center justify-center"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -right-4 -top-4 rounded-2xl border-2 border-fire-500 bg-black px-4 py-2">
                <span className="text-sm font-black uppercase tracking-[0.1em] text-fire-500">
                  Handmade
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-white">
                  Rođeni u plamenu, odgajani u buntu
                </h2>
                
                <div className="space-y-4 text-white/70">
                  <p>
                    Smokin&apos; Hot nije nastao u korporativnim kuhinjama. Rodio se u podrumu,
                    među rockovima i ljubiteljima pravog ukusa koji su se borili protiv 
                    dominacije bljutavih sosova.
                  </p>
                  
                  <p>
                    Počelo je sa jednim pitanjem: &quot;Zašto srpski ljuti sosovi ne mogu da budu
                    jednako dobri kao meksički?&quot; Odgovor je stigao kroz mesece eksperimenata,
                    opekotina i perfektovanja receptura.
                  </p>
                  
                  <p>
                    Danas, svaki sos koji nosiš kući je testament našeg bunta protiv 
                    prosečnosti. Ne prodajemo samo sos - prodajemo revoluciju ukusa.
                  </p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-ember-500 pl-6 italic text-white/80">
                &quot;Ljutina nije kazna, već oslobođenje od dosadnih obroka.&quot;
                <footer className="mt-2 text-sm font-bold text-ember-500">
                  — Osnivači Smokin&apos; Hot-a
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
        <section className="border-y border-white/8 bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Naši principi
            </h2>
            <p className="mx-auto max-w-2xl text-white/70">
              Tri stuba na kojima gradimo svaki sos i svaku interakciju sa vama
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Principle 1 */}
            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full border border-ember-500/30 bg-ember-500/10 p-4 transition group-hover:bg-ember-500/20">
                  <FireIcon className="h-8 w-8 text-ember-500" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Autentičnost</h3>
              <p className="text-white/70">
                Svaki sos je ručno napravljen u malim serijama. Nema fabričke proizvodnje, 
                nema kompromisa sa ukusom.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full border border-warning-500/30 bg-warning-500/10 p-4 transition group-hover:bg-warning-500/20">
                  <HeartIcon className="h-8 w-8 text-warning-500" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Strast</h3>
              <p className="text-white/70">
                Ljubav prema ljutini nije posao - to je način života. Svaki sos 
                pravi neko ko stvarno veruje u ono što radi.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full border border-mild-500/30 bg-mild-500/10 p-4 transition group-hover:bg-mild-500/20">
                  <ShieldCheckIcon className="h-8 w-8 text-mild-500" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Poverenje</h3>
              <p className="text-white/70">
                Plaćaš kad vidiš da je sos stvarno dobar. Ne tražimo poverenje unapred - 
                zarađujemo ga svakim sosem.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Process Section */}
        <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Kako nastaju naši sosovi
            </h2>
            <p className="mx-auto max-w-2xl text-white/70">
              Od ideje do flašice - transparentan proces bez skrivenih sastojaka
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Selekcija',
                description: 'Biramo samo najkvalitetnije paprike i začine. Bez kompromisa.'
              },
              {
                step: '02', 
                title: 'Kreiranje',
                description: 'Eksperimentišemo dok ne postignemo savršenu ravnotežu ukusa i ljutine.'
              },
              {
                step: '03',
                title: 'Testiranje',
                description: 'Svaki batch prolazi kroz rigorozno testiranje sa našim tim gurmana.'
              },
              {
                step: '04',
                title: 'Pakovanje',
                description: 'Ručno pakujemo u male serije sa maksimalnom pažnjom za detalje.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ember-500 text-xl font-black text-ember-500">
                    {item.step}
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/8 bg-gradient-to-br from-surface to-black py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Spremni ste za revoluciju ukusa?
          </h2>
          <p className="mb-8 text-lg text-white/70">
            Ne čekajte da vam neko kaže da li je dobro. Probajte sami i odlučite.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="/shop"
              className="inline-flex items-center justify-center border-2 border-fire-500 bg-fire-500 px-8 py-4 text-lg font-bold uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1"
            >
              Istraži shop
            </a>
            <a
              href="/kontakt"
              className="inline-flex items-center justify-center border-2 border-white/20 px-8 py-4 text-lg font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/5"
            >
              Kontaktiraj nas
            </a>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}