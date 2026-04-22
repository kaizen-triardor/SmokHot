'use client'

/**
 * Dashboard card that surfaces the warm-serve health (Tier 2 architecture).
 * Calls /api/admin/warm-serve-status which returns last cron ping timestamp
 * and per-resource snapshot ages. Lets the admin see the site's resilience
 * layer at a glance.
 */
import { useEffect, useState } from 'react'
import { CheckBadgeIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface WarmServeStatus {
  lastHealthPing: string | null
  lastHealthPingAgeMs: number | null
  snapshots: Record<string, { source: 'hot' | 'bundled' | 'missing'; savedAt: string | null }>
  now: string
}

function formatAge(ms: number | null): string {
  if (ms == null) return 'nikad'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const d = Math.floor(hr / 24)
  return `${d}d`
}

function ageMs(iso: string | null, now: string): number | null {
  if (!iso) return null
  return new Date(now).getTime() - new Date(iso).getTime()
}

export default function WarmServeWidget() {
  const [status, setStatus] = useState<WarmServeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setErr(null)
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/warm-serve-status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Greška')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-5 text-sm text-white/60">
        Učitavanje statusa sistema…
      </div>
    )
  }

  if (err || !status) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-5 text-sm text-white/60">
        Status sistema nedostupan.
      </div>
    )
  }

  // Keep-alive is healthy if last ping < 7 days old, or we're in dev (no cron yet).
  const pingOk =
    status.lastHealthPingAgeMs != null && status.lastHealthPingAgeMs < 7 * 24 * 3600 * 1000
  const snapshotKeys = Object.keys(status.snapshots)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-warning-400">
            Status sistema
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Warm-serve (keep-alive + snapshot fallback) zaštita za Supabase pauzu
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          title="Osveži"
        >
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Keep-alive card */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            {pingOk ? (
              <CheckBadgeIcon className="h-5 w-5 text-mild-400" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
            )}
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">
              Keep-alive cron
            </span>
          </div>
          <div className="text-sm text-white">
            {status.lastHealthPing
              ? `Pre ${formatAge(status.lastHealthPingAgeMs)}`
              : 'Nikad pokrenut'}
          </div>
          <div className="mt-1 text-xs text-white/45">
            {pingOk
              ? 'Baza ostaje aktivna'
              : 'Pokrenuti GET /api/health ili dodati cron'}
          </div>
        </div>

        {/* Snapshots card */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckBadgeIcon
              className={`h-5 w-5 ${
                snapshotKeys.every((k) => status.snapshots[k].source !== 'missing')
                  ? 'text-mild-400'
                  : 'text-warning-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">
              Snapshot keš
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {snapshotKeys.map((k) => {
              const snap = status.snapshots[k]
              const age = ageMs(snap.savedAt, status.now)
              const color =
                snap.source === 'hot'
                  ? 'text-mild-400'
                  : snap.source === 'bundled'
                    ? 'text-warning-400'
                    : 'text-fire-500'
              return (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-white/70">{k}</span>
                  <span className={color}>
                    {snap.source === 'missing' ? '—' : formatAge(age)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
