import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description:
    'Politika privatnosti sajta smokinhot.rs — kako SmokinHot Collective prikuplja, koristi i štiti lične podatke kupaca.',
}

const EFFECTIVE_DATE = '22. april 2026.'

export default function PolitikaPrivatnostiPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.18),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        <section className="border-b border-white/8 bg-surface py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-fire-500">Pravna napomena</p>
            <h1 className="font-display text-4xl font-black uppercase tracking-[0.04em] text-white sm:text-5xl">
              Politika privatnosti
            </h1>
            <p className="mt-4 text-sm text-white/60">Poslednje ažuriranje: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-6">
            <article className="prose prose-invert max-w-none space-y-8 text-white/80">
              <p className="text-base leading-7">
                SmokinHot Collective (u daljem tekstu: <strong>„Prodavac“</strong>) poštuje vašu privatnost i
                zakonsku obavezu da lične podatke obrađuje u skladu sa Zakonom o zaštiti podataka o
                ličnosti Republike Srbije („Sl. glasnik RS“, br. 87/2018) i opštim evropskim GDPR
                principima. Ova politika opisuje koje podatke prikupljamo, kako ih koristimo i koja
                prava imate.
              </p>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  1. Rukovalac podacima
                </h2>
                <ul className="mt-3 space-y-1 text-sm leading-7">
                  <li><strong>Firma:</strong> SmokinHot Collective</li>
                  <li><strong>Adresa:</strong> Srednjokrajska 23D, Barajevo, 11000 Beograd, Srbija</li>
                  <li><strong>Email:</strong> <a href="mailto:smokinhotcollective@gmail.com" className="text-fire-500 hover:underline">smokinhotcollective@gmail.com</a></li>
                  <li><strong>Telefon:</strong> +381 63 644 599</li>
                  <li><strong>PIB:</strong> <em className="text-white/50">(biće dodato nakon registracije)</em></li>
                  <li><strong>Matični broj:</strong> <em className="text-white/50">(biće dodato nakon registracije)</em></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  2. Koje podatke prikupljamo
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Pri naručivanju proizvoda ili slanju poruke preko kontakt forme prikupljamo samo one
                  podatke koji su neophodni za obradu vaše narudžbine ili upita:
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-7">
                  <li>Ime i prezime</li>
                  <li>Broj telefona</li>
                  <li>Email adresa</li>
                  <li>Adresa za dostavu (ulica, broj, grad, poštanski broj)</li>
                  <li>Napomena uz narudžbinu (opciono)</li>
                  <li>Tehnički podaci (IP adresa, tip uređaja, pregledač) u svrhu statistike i bezbednosti</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  3. Zašto koristimo podatke
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-7">
                  <li>Da vam dostavimo naručene proizvode</li>
                  <li>Da vas kontaktiramo u vezi sa statusom narudžbine</li>
                  <li>Da odgovorimo na upit poslat preko kontakt forme</li>
                  <li>Da ispunimo zakonske obaveze (računovodstvene, poreske)</li>
                  <li>Da poboljšamo rad sajta (anonimna statistika)</li>
                </ul>
                <p className="mt-3 text-sm leading-7">
                  Vaše podatke <strong>ne koristimo</strong> u marketinške svrhe niti ih delimo sa trećim
                  licima, izuzev kurirske službe koja dostavlja paket i nadležnih državnih organa kada
                  to zahteva zakon.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  4. Koliko dugo čuvamo podatke
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Podatke o narudžbini čuvamo onoliko koliko nalaže Zakon o računovodstvu (najmanje 5
                  godina). Podatke iz kontakt forme čuvamo najduže 12 meseci nakon poslednje prepiske,
                  osim ako od vas ne dobijemo izričit pristanak za duže čuvanje.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  5. Vaša prava
                </h2>
                <p className="mt-3 text-sm leading-7">U skladu sa važećim propisima imate pravo da:</p>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-7">
                  <li>Pristupite svojim podacima i zatražite kopiju</li>
                  <li>Ispravite netačne ili zastarele podatke</li>
                  <li>Zatražite brisanje podataka („pravo na zaborav“)</li>
                  <li>Povučete pristanak za obradu</li>
                  <li>Podnesete pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti</li>
                </ul>
                <p className="mt-3 text-sm leading-7">
                  Sve zahteve u vezi sa vašim podacima pošaljite na
                  {' '}
                  <a href="mailto:smokinhotcollective@gmail.com" className="text-fire-500 hover:underline">
                    smokinhotcollective@gmail.com
                  </a>.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  6. Kolačići (cookies)
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Sajt koristi osnovne tehničke kolačiće neophodne za rad korpe i prijave u admin panel.
                  Ne koristimo reklamne ili trekovače treće strane bez vašeg pristanka.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  7. Bezbednost
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Sajt koristi HTTPS enkripciju. Podaci se čuvaju na serveru u EU regionu (Supabase /
                  Vercel). Pristup bazi imaju samo ovlašćena lica.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
                  8. Izmene politike
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Zadržavamo pravo da povremeno ažuriramo ovu politiku. Datum poslednje izmene je
                  naveden na vrhu stranice.
                </p>
              </div>

              <div className="rounded-2xl border border-fire-500/20 bg-fire-500/5 p-6">
                <p className="text-sm leading-7">
                  Imate pitanje u vezi sa privatnošću? Kontaktirajte nas preko{' '}
                  <Link href={'/kontakt' as any} className="font-bold text-fire-500 hover:underline">
                    kontakt forme
                  </Link>{' '}
                  ili mejlom.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
