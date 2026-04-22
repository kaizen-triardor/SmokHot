'use client'

/**
 * WarmupOverlay — visitor-facing safety net.
 *
 * Monitors global fetch() traffic. If any request stays in-flight longer than
 * SHOW_DELAY_MS (2 sec default), shows a branded overlay with an animated
 * flame and friendly copy. Dismisses the moment all in-flight requests
 * resolve. Never blocks interaction — it just reassures the visitor that
 * something is happening during the rare cold-DB window.
 *
 * Design choices:
 *  - Delay prevents the overlay from flashing for fast requests.
 *  - We wrap window.fetch (not XHR) because the app's data layer uses fetch
 *    exclusively.
 *  - Excluded paths: /api/admin/* (admin knows the system; overlay would be
 *    annoying there) and /api/health (cron/diagnostic traffic).
 *  - Does not persist or animate state on unmount — every page mount is a
 *    fresh start.
 */
import { useEffect, useState } from 'react'

const SHOW_DELAY_MS = 2000

// Global flag so HMR doesn't double-patch fetch.
declare global {
  interface Window {
    __smokhotWarmupPatched__?: boolean
  }
}

function shouldWatch(input: RequestInfo | URL): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  // Only watch own-origin API traffic.
  if (!url.includes('/api/')) return false
  // Skip admin & health — overlay would be noise there.
  if (url.includes('/api/admin/')) return false
  if (url.includes('/api/health')) return false
  return true
}

export default function WarmupOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__smokhotWarmupPatched__) return
    window.__smokhotWarmupPatched__ = true

    const inflight = new Set<Promise<unknown>>()
    let showTimer: ReturnType<typeof setTimeout> | null = null

    const scheduleShow = () => {
      if (showTimer) return
      showTimer = setTimeout(() => {
        if (inflight.size > 0) setVisible(true)
      }, SHOW_DELAY_MS)
    }

    const cancelShow = () => {
      if (showTimer) {
        clearTimeout(showTimer)
        showTimer = null
      }
      if (inflight.size === 0) setVisible(false)
    }

    const originalFetch = window.fetch.bind(window)
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [input] = args
      if (!shouldWatch(input)) return originalFetch(...args)

      const p = originalFetch(...args)
      inflight.add(p)
      scheduleShow()

      try {
        const res = await p
        return res
      } finally {
        inflight.delete(p)
        cancelShow()
      }
    }

    return () => {
      // On unmount we intentionally DO NOT un-patch — HMR flag prevents
      // double patching anyway, and restoring mid-session risks dropped
      // promises.
    }
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Sajt se budi"
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="pointer-events-auto max-w-sm px-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center">
          <span className="animate-pulse text-7xl drop-shadow-[0_0_20px_rgba(229,36,33,0.8)]">
            🔥
          </span>
        </div>
        <p className="mt-6 font-display text-2xl font-black uppercase tracking-[0.18em] text-fire-500">
          Smokin&apos; Hot
        </p>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.15em] text-white/90">
          Zagreva peglu…
        </p>
        <p className="mt-4 text-xs text-white/55">
          Trenutak, sos uskoro stiže.
        </p>
      </div>
    </div>
  )
}
