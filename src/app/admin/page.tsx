'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        // Store session token
        localStorage.setItem('admin-token', data.token)
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Neispravni podaci')
      }
    } catch (error) {
      setError('Greška pri prijavljivanju')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-950 text-[#f6f1e7] font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.1),transparent_40%),radial-gradient(circle_at_left,rgba(229,36,33,0.12),transparent_35%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.02] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:20px_20px]" />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-warning-400 bg-fire-500 text-xl font-black text-white shadow-[0_0_30px_rgba(229,36,33,0.4)]">
              SH
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Smokin&apos; Hot
            </h1>
            <p className="text-sm text-white/60 uppercase tracking-[0.15em]">
              Admin Panel
            </p>
          </div>

          {/* Login Form */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-surface to-primary-950 p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">
                Prijavite se
              </h2>
              <p className="text-sm text-white/70">
                Pristup CMS sistemu
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 transition focus:border-fire-500 focus:bg-black/60 focus:outline-none focus:ring-2 focus:ring-fire-500/20"
                  placeholder="admin@smokhot.rs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-white/80 mb-2">
                  Lozinka
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 transition focus:border-fire-500 focus:bg-black/60 focus:outline-none focus:ring-2 focus:ring-fire-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-black bg-fire-500 px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-fire-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Prijavljivanje...' : 'Prijavite se'}
              </button>
            </form>

            <div className="mt-6 text-xs text-white/50 text-center">
              Smokin&apos; Hot CMS &copy; 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}