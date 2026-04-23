import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Uslovi korišćenja',
  description:
    'Uslovi korišćenja sajta smokinhot.rs — pravila naručivanja, dostave, reklamacija i povraćaja robe.',
}

const EFFECTIVE_DATE = '22. april 2026.'

export default function UsloviKoriscenjaPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.18),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        <section className="border-b border-white/8 bg-surface py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-fire-500">Pravna napomena</p>
            <h1 className="font-display text-4xl font-black uppercase tracking-[0.04em] text-white sm:text-5xl">
              Uslovi korišćenja
            </h1>
            <p className="mt-4 text-sm text-white/60">Poslednje ažuriranje: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-6">
            <article className="space-y-8 text-white/80">
              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">1. Prodavac</h2>
                <p className="mt-3 text-sm leading-7">
                  Sajt smokinhot.rs posluje pod imenom <strong>SmokinHot Collective</strong>,
                  Srednjokrajska 23D, Barajevo, 11000 Beograd, Srbija. Kontakt:
                  {' '}
                  <a href="mailto:smokinhotcollective@gmail.com" className="text-fire-500 hover:underline">
                    smokinhotcollective@gmail.com
                  </a>, +381 63 644 599.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">2. Naručivanje</h2>
                <p className="mt-3 text-sm leading-7">
                  Narudžbine se mogu poslati preko sajta 24 / 7. Nakon slanja narudžbine dobijate
                  potvrdu na email koji ste uneli. Prodavac zadržava pravo da odbije narudžbinu u
                  slučaju nedostatka robe, sumnje na zloupotrebu ili netačnih podataka.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">3. Cene</h2>
                <p className="mt-3 text-sm leading-7">
                  Sve cene su izražene u dinarima (RSD) i uključuju sve pripadajuće poreze. Cene mogu
                  biti izmenjene bez prethodne najave; validna je cena prikazana u trenutku slanja
                  narudžbine.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">4. Plaćanje</h2>
                <p className="mt-3 text-sm leading-7">
                  Trenutno je moguće samo <strong>plaćanje pouzećem</strong> — plaćate dostavljaču u
                  gotovini kada vam paket stigne. Plaćanje karticama se uvodi u kasnijoj fazi.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">5. Dostava</h2>
                <p className="mt-3 text-sm leading-7">
                  Dostavljamo širom Srbije putem kurirske službe. Okvirni rok isporuke je 1–3 radna
                  dana od trenutka potvrde narudžbine. Cena dostave se određuje prema cenovniku
                  kurirske službe i načinu slanja. Za narudžbine iznad 3.000 RSD može biti odobrena
                  besplatna dostava — finalna vrednost je prikazana na stranici za potvrdu
                  narudžbine.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">6. Povraćaj i reklamacije</h2>
                <p className="mt-3 text-sm leading-7">
                  U skladu sa Zakonom o zaštiti potrošača, imate pravo da odustanete od kupovine u roku
                  od <strong>14 dana</strong> od prijema robe, bez navođenja razloga. Roba mora biti
                  neotvorena, u originalnom pakovanju i bez oštećenja. Troškove povraćaja snosi kupac.
                </p>
                <p className="mt-3 text-sm leading-7">
                  Reklamacije zbog oštećenja ili nedostatka proizvoda šaljete na
                  {' '}
                  <a href="mailto:smokinhotcollective@gmail.com" className="text-fire-500 hover:underline">
                    smokinhotcollective@gmail.com
                  </a>
                  {' '}
                  sa brojem narudžbine i fotografijom oštećenja. Odgovor šaljemo u roku od 8 dana u
                  skladu sa zakonom.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">7. Odgovornost</h2>
                <p className="mt-3 text-sm leading-7">
                  Proizvodi su ljuti sosovi — koristite ih odgovorno i u količini primerenoj vašoj
                  toleranciji. Prodavac ne odgovara za posledice neodgovornog konzumiranja. Proizvod
                  ne koristiti u slučaju alergije na neki od sastojaka navedenih na etiketi ili
                  stranici proizvoda.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">8. Intelektualna svojina</h2>
                <p className="mt-3 text-sm leading-7">
                  Logo, grafika, tekst i fotografije na sajtu vlasništvo su SmokinHot Collective-a. Bilo
                  kakvo preuzimanje bez pismene dozvole nije dozvoljeno.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">9. Nadležnost</h2>
                <p className="mt-3 text-sm leading-7">
                  Sporove ćemo rešavati sporazumno. U slučaju da to nije moguće, nadležan je sud u
                  Beogradu, prema važećim propisima Republike Srbije.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">10. Izmene uslova</h2>
                <p className="mt-3 text-sm leading-7">
                  Zadržavamo pravo da izmenimo ove uslove bez prethodne najave. Važeći su uslovi
                  objavljeni na dan slanja narudžbine.
                </p>
              </div>

              <div className="rounded-2xl border border-fire-500/20 bg-fire-500/5 p-6">
                <p className="text-sm leading-7">
                  Pitanje ili potreba za reklamacijom? Pišite nam preko{' '}
                  <Link href={'/kontakt' as any} className="font-bold text-fire-500 hover:underline">
                    kontakt forme
                  </Link>
                  {' '}
                  ili direktno na email.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
