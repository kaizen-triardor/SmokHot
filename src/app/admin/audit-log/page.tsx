'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ClipboardDocumentListIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface AuditEntry {
  id: string
  adminId: string
  adminEmail: string
  action: string
  resource: string
  resourceId: string | null
  summary: string | null
  metadata: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-500/20 text-green-400',
  UPDATE: 'bg-blue-500/20 text-blue-400',
  DELETE: 'bg-red-500/20 text-red-400',
  LOGIN: 'bg-gray-500/20 text-gray-300',
  LOGIN_FAILED: 'bg-red-500/20 text-red-400',
  PASSWORD_CHANGE: 'bg-yellow-500/20 text-yellow-400',
  BULK_UPDATE: 'bg-purple-500/20 text-purple-400',
}

const RESOURCES = ['product', 'order', 'blog', 'gallery', 'turneja', 'settings', 'admin', 'upload']
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'PASSWORD_CHANGE', 'BULK_UPDATE']

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [resource, setResource] = useState<string>('')
  const [action, setAction] = useState<string>('')

  const token = () => localStorage.getItem('admin-token') || ''

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (resource) params.set('resource', resource)
      if (action) params.set('action', action)
      params.set('limit', '200')
      const res = await fetch(`/api/admin/audit-log?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (!res.ok) throw new Error('Greška pri učitavanju')
      setLogs(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, action])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return logs
    return logs.filter((l) => {
      return (
        l.adminEmail.toLowerCase().includes(query) ||
        l.resource.toLowerCase().includes(query) ||
        (l.summary?.toLowerCase().includes(query) ?? false) ||
        (l.resourceId?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [logs, q])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ClipboardDocumentListIcon className="h-7 w-7 text-ember-500" />
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.03em] text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-white/60">Evidencija svih administratorskih akcija</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraga po email-u, resursu, opisu…"
            className="w-full rounded-xl border border-white/15 bg-[#111113] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/40 focus:border-ember-500 focus:outline-none"
          />
        </div>
        <select
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          className="rounded-xl border border-white/15 bg-[#111113] px-3 py-2.5 text-sm text-white focus:border-ember-500 focus:outline-none"
        >
          <option value="">Svi resursi</option>
          {RESOURCES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-white/15 bg-[#111113] px-3 py-2.5 text-sm text-white focus:border-ember-500 focus:outline-none"
        >
          <option value="">Sve akcije</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/60">Učitavanje…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-12 text-center text-white/50">
          Još nema zapisa.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/70">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-black/20">
                <tr>
                  <th className="p-3 text-left text-xs font-bold text-white/80">Vreme</th>
                  <th className="p-3 text-left text-xs font-bold text-white/80">Admin</th>
                  <th className="p-3 text-left text-xs font-bold text-white/80">Akcija</th>
                  <th className="p-3 text-left text-xs font-bold text-white/80">Resurs</th>
                  <th className="p-3 text-left text-xs font-bold text-white/80">Opis</th>
                  <th className="p-3 text-left text-xs font-bold text-white/80">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-white/5">
                    <td className="p-3 text-white/70 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString('sr-RS')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 flex-shrink-0 text-white/40" />
                        <span className="truncate text-white/80">{l.adminEmail}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${ACTION_COLORS[l.action] || 'bg-gray-500/20 text-gray-400'}`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3 text-white/80">
                      {l.resource}
                      {l.resourceId && (
                        <span className="ml-1 font-mono text-[10px] text-white/40">
                          {l.resourceId.slice(0, 10)}…
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-white/70">{l.summary || '—'}</td>
                    <td className="p-3 font-mono text-xs text-white/50">{l.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
