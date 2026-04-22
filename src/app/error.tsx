'use client'

/**
 * Brand-styled global error boundary. Rendered when an error bubbles up to
 * the root segment (e.g. DB genuinely down AND all warm-serve layers miss).
 */
import { useEffect } from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-fire-500 bg-fire-500/10">
            <ExclamationTriangleIcon className="h-8 w-8 text-fire-500" />
          </div>
          <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-fire-500">
            500 · Nešto je zapalilo kuhinju
          </p>
          <h1 className="font-display text-4xl font-black uppercase tracking-[0.03em] text-white sm:text-5xl">
            Tehnička greška
          </h1>
          <p className="mt-4 text-base leading-7 text-white/70">
            Ups — došlo je do neočekivane greške. Pokušaj osvežavanje; ako se ponavlja,
            javi nam se i posao je rešen.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-[11px] text-white/40">ref: {error.digest}</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 border-2 border-fire-500 bg-fire-500 px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Pokušaj ponovo
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-white/80 transition hover:bg-white/5"
            >
              <HomeIcon className="h-4 w-4" />
              Početna
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
