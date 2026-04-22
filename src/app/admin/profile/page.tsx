'use client'

/**
 * Admin profile page — shows identity + exposes password change.
 */
import { useEffect, useState } from 'react'
import {
  UserCircleIcon,
  KeyIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

interface AdminProfile {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  lastLoginAt: string | null
  passwordChangedAt: string | null
  createdAt: string
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const token = () => localStorage.getItem('admin-token') || ''

  useEffect(() => {
    fetch('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('Greška pri učitavanju profila')
        setProfile(await r.json())
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const strengthOk = (pw: string) =>
    pw.length >= 8 && /[A-Za-zšđčćžŠĐČĆŽ]/.test(pw) && /\d/.test(pw)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!currentPassword) {
      setFormError('Unesi trenutnu lozinku.')
      return
    }
    if (!strengthOk(newPassword)) {
      setFormError('Nova lozinka mora imati min 8 karaktera, bar jedno slovo i jedan broj.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Nova lozinka i potvrda se ne poklapaju.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data.error || 'Greška pri promeni lozinke.')
        return
      }
      setFormSuccess('Lozinka je uspešno promenjena.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Refresh profile to pull new passwordChangedAt
      const r = await fetch('/api/admin/profile', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (r.ok) setProfile(await r.json())
    } catch {
      setFormError('Greška pri slanju zahteva.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/60">Učitavanje profila…</div>
      </div>
    )
  }

  if (fetchError || !profile) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        {fetchError || 'Profil nije dostupan'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-[0.03em] text-white">Moj nalog</h1>
        <p className="mt-2 text-white/70">Pregled naloga i promena lozinke</p>
      </div>

      {/* Identity card */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#111113]/70 p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ember-500 to-fire-500">
            <UserCircleIcon className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{profile.name}</h2>
            <p className="truncate text-sm text-white/60">{profile.email}</p>
          </div>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-white/50">Uloga</dt>
            <dd className="font-medium text-white">
              {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Status</dt>
            <dd>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  profile.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {profile.active ? 'Aktivan' : 'Neaktivan'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Nalog kreiran</dt>
            <dd className="text-white/80">
              {new Date(profile.createdAt).toLocaleString('sr-RS')}
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Poslednja prijava</dt>
            <dd className="text-white/80">
              {profile.lastLoginAt
                ? new Date(profile.lastLoginAt).toLocaleString('sr-RS')
                : '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-white/50">Poslednja promena lozinke</dt>
            <dd className="text-white/80">
              {profile.passwordChangedAt
                ? new Date(profile.passwordChangedAt).toLocaleString('sr-RS')
                : '— (nikad)'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-white/10 bg-[#111113]/70 p-6 backdrop-blur">
        <div className="mb-5 flex items-center gap-2">
          <KeyIcon className="h-5 w-5 text-ember-500" />
          <h2 className="text-lg font-bold text-white">Promena lozinke</h2>
        </div>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <CheckIcon className="h-4 w-4" />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current" className="mb-1.5 block text-sm font-bold text-white/80">
              Trenutna lozinka
            </label>
            <div className="relative">
              <input
                id="current"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 pr-10 text-white focus:border-ember-500 focus:outline-none"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 hover:text-white"
                aria-label={showCurrent ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showCurrent ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new" className="mb-1.5 block text-sm font-bold text-white/80">
              Nova lozinka
            </label>
            <div className="relative">
              <input
                id="new"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 pr-10 text-white focus:border-ember-500 focus:outline-none"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 hover:text-white"
                aria-label={showNew ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showNew ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Min 8 karaktera, bar jedno slovo i jedan broj.
            </p>
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-bold text-white/80">
              Potvrda nove lozinke
            </label>
            <input
              id="confirm"
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-white focus:border-ember-500 focus:outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border-2 border-ember-500 bg-ember-500 px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? 'Čuvanje…' : 'Promeni lozinku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
