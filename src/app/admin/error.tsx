'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-fire-500/30 bg-[#111113] p-6">
        <div className="mb-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-fire-500" />
          <h2 className="text-lg font-bold text-white">Greška u admin panelu</h2>
        </div>
        <p className="mb-4 text-sm text-white/70">
          Došlo je do neočekivane greške. Pokušaj osvežavanje; ako se ponavlja,
          kontaktiraj podršku.
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-[11px] text-white/40">ref: {error.digest}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-lg border-2 border-ember-500 bg-ember-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Pokušaj ponovo
          </button>
          <Link
            href={'/admin/dashboard' as any}
            className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/80 transition hover:bg-white/5"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
