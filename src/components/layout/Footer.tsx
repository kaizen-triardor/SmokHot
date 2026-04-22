'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { EnvelopeIcon, PhoneIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline'

const primaryNav = [
  { name: 'Shop', href: '/shop' },
  { name: 'Blog', href: '/blog' },
  { name: 'Galerija', href: '/galerija' },
  { name: 'O Nama', href: '/o-nama' },
  { name: 'Kontakt', href: '/kontakt' },
]

const legalNav = [
  { name: 'Politika privatnosti', href: '/politika-privatnosti' },
  { name: 'Uslovi korišćenja', href: '/uslovi-koriscenja' },
  { name: 'Reklamacije', href: '/uslovi-koriscenja#reklamacije' },
  { name: 'Dostava i plaćanje', href: '/uslovi-koriscenja#dostava' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const pathname = usePathname()

  // Public footer never renders on admin routes.
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-[#0b0b0d]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {/* Top row — 4 cols on desktop */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-warning-400 bg-black/20 p-1">
                <Image
                  src="/SmokHotLogo.png"
                  alt="Smokin' Hot logo"
                  width={32}
                  height={32}
                  className="h-auto w-auto object-contain"
                />
              </div>
              <div className="text-left">
                <div className="font-display text-lg font-black uppercase tracking-[0.12em] text-white">
                  Smokin&apos; Hot
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-warning-400">
                  Collective
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Srpski ljuti sosovi za one koji se ne plaše vatre. Ručno pravljeni,
              dostava pouzećem širom Srbije.
            </p>
          </div>

          {/* Primary nav */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-warning-400">
              Navigacija
            </h3>
            <ul className="space-y-2 text-sm">
              {primaryNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href as any}
                    className="text-white/70 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-warning-400">
              Informacije
            </h3>
            <ul className="space-y-2 text-sm">
              {legalNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href as any}
                    className="text-white/70 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + trust */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-warning-400">
              Kontakt
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-fire-500" aria-hidden="true" />
                <a href="tel:+381636445599" className="transition hover:text-white">
                  +381 63 644 599
                </a>
              </li>
              <li className="flex items-start gap-2">
                <EnvelopeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-fire-500" aria-hidden="true" />
                <a href="mailto:smokinhotcollective@gmail.com" className="transition hover:text-white break-all">
                  smokinhotcollective@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <TruckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-fire-500" aria-hidden="true" />
                <span>Dostava 1–3 radna dana</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCardIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-fire-500" aria-hidden="true" />
                <span>Plaćanje pouzećem</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/smokhot/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                aria-label="Smokin' Hot na Instagramu"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/smokhot/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                aria-label="Smokin' Hot na Facebook-u"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@smokhot011"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                aria-label="Smokin' Hot na TikTok-u"
              >
                TikTok
              </a>
              <a
                href="https://www.linkedin.com/company/71262668"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white/70 transition hover:border-fire-500 hover:text-fire-500"
                aria-label="Smokin' Hot na LinkedIn-u"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            © {year} SmokinHot Collective · Srednjokrajska 23D, Barajevo, 11000 Beograd · Sva prava zadržana.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="uppercase tracking-[0.2em]">Made in Serbia</span>
            <span className="text-white/20">·</span>
            <span className="uppercase tracking-[0.2em]">Handcrafted</span>
            <span className="text-white/20">·</span>
            <span className="uppercase tracking-[0.2em]">COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
