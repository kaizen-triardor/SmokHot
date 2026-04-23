import { Link } from '@/i18n/navigation'
import { FireIcon, HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fire-500 to-ember-500 shadow-[0_0_40px_rgba(229,36,33,0.4)]">
            <FireIcon className="h-10 w-10 text-white" />
          </div>
          <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-fire-500">
            404 · Izgubljeno u vatri
          </p>
          <h1 className="font-display text-5xl font-black uppercase tracking-[0.03em] text-white sm:text-6xl">
            Stranica ne postoji
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70">
            Ova ljutina nije pronađena. Možda je spaljena, možda još nije stigla — u
            svakom slučaju, vrati se na put.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border-2 border-fire-500 bg-fire-500 px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
            >
              <HomeIcon className="h-4 w-4" />
              Početna
            </Link>
            <Link
              href={'/shop' as any}
              className="inline-flex items-center justify-center gap-2 border-2 border-warning-400 px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-warning-400 transition hover:bg-warning-400/10"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
