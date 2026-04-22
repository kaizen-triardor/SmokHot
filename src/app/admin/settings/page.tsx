'use client'

import { useState, useEffect } from 'react'
import { CheckIcon, BuildingStorefrontIcon, TruckIcon, CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface DbSetting {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

interface SettingConfig {
  key: string
  label: string
  description: string
  type: 'text' | 'number' | 'boolean' | 'select'
  group: 'shop' | 'delivery' | 'payment'
  options?: string[]
  suffix?: string
}

const SETTING_DEFINITIONS: SettingConfig[] = [
  {
    key: 'shop_status',
    label: 'Status prodavnice',
    description: 'Da li je online prodavnica otvorena',
    type: 'select',
    group: 'shop',
    options: ['open', 'closed', 'maintenance'],
  },
  {
    key: 'currency',
    label: 'Valuta',
    description: 'Valuta koja se koristi za cene',
    type: 'text',
    group: 'shop',
  },
  {
    key: 'min_order_amount',
    label: 'Minimalna porudžbina',
    description: 'Minimalna vrednost porudžbine (0 = nije ograničeno)',
    type: 'number',
    group: 'shop',
    suffix: 'RSD',
  },
  {
    key: 'low_stock_alert',
    label: 'Upozorenje za niske zalihe',
    description: 'Prag iznad kojeg se proizvodi tretiraju kao "malo zaliha" na dashboard-u',
    type: 'number',
    group: 'shop',
    suffix: 'kom',
  },
  {
    key: 'delivery_cost',
    label: 'Cena dostave',
    description: 'Standardna cena dostave (orijentaciono; konačna cena prema kuriru)',
    type: 'number',
    group: 'delivery',
    suffix: 'RSD',
  },
  {
    key: 'free_delivery_threshold',
    label: 'Besplatna dostava od',
    description: 'Ukupna vrednost porudžbine iznad koje je dostava besplatna',
    type: 'number',
    group: 'delivery',
    suffix: 'RSD',
  },
  {
    key: 'payment_cod',
    label: 'Plaćanje pouzećem',
    description: 'Da li je omogućeno plaćanje pouzećem',
    type: 'boolean',
    group: 'payment',
  },
]

const GROUPS = {
  shop: { name: 'Prodavnica', Icon: BuildingStorefrontIcon },
  delivery: { name: 'Dostava', Icon: TruckIcon },
  payment: { name: 'Plaćanje', Icon: CreditCardIcon },
} as const

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('admin-token')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: 'Bearer ' + token },
      })
      if (!res.ok) throw new Error('Greška pri učitavanju postavki')
      const data: DbSetting[] = await res.json()

      const map: Record<string, string> = {}
      for (const s of data) map[s.key] = s.value

      // Migrate stale shop_status='active' → 'open' on the fly so the select
      // binds correctly. The actual DB value is normalized the first time
      // user saves. Cosmetic until then.
      if (map.shop_status === 'active') map.shop_status = 'open'

      setSettings(map)
      setEditValues({ ...map })
      setChangedKeys(new Set())
    } catch (err: any) {
      setError(err.message || 'Greška pri učitavanju')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }))
    const changed = new Set(changedKeys)
    if (value !== (settings[key] ?? '')) changed.add(key)
    else changed.delete(key)
    setChangedKeys(changed)
  }

  const handleSaveAll = async () => {
    if (changedKeys.size === 0) return
    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    const token = getToken()

    try {
      for (const key of Array.from(changedKeys)) {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, value: editValues[key] }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Greška pri čuvanju: ${key}`)
        }
      }

      setSettings({ ...editValues })
      setChangedKeys(new Set())
      setSuccessMsg('Postavke su uspešno sačuvane.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Greška pri čuvanju')
    } finally {
      setSaving(false)
    }
  }

  const getDisplayValue = (config: SettingConfig, value: string | undefined) => {
    const val = value ?? ''
    if (config.type === 'boolean') return val === 'true' ? 'Omogućeno' : 'Onemogućeno'
    if (config.type === 'select') {
      if (val === 'open') return 'Otvoren'
      if (val === 'closed') return 'Zatvoren'
      if (val === 'maintenance') return 'Održavanje'
      return val
    }
    if (config.type === 'number' && val === '0') return 'Nije ograničeno'
    return val + (config.suffix && val && val !== '0' ? ' ' + config.suffix : '')
  }

  const getStatusColor = (config: SettingConfig, value: string | undefined) => {
    const val = value ?? ''
    if (config.type === 'boolean') {
      return val === 'true' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }
    if (config.type === 'select') {
      if (val === 'open') return 'bg-green-500/20 text-green-400'
      if (val === 'closed') return 'bg-red-500/20 text-red-400'
      if (val === 'maintenance') return 'bg-yellow-500/20 text-yellow-400'
    }
    return 'bg-blue-500/20 text-blue-400'
  }

  const renderInput = (config: SettingConfig) => {
    const value = editValues[config.key] ?? ''
    const isChanged = changedKeys.has(config.key)

    if (config.type === 'boolean') {
      return (
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-white">
            <input
              type="radio"
              checked={value === 'true'}
              onChange={() => handleChange(config.key, 'true')}
              className="text-ember-500 focus:ring-ember-500"
            />
            Omogući
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-white">
            <input
              type="radio"
              checked={value !== 'true'}
              onChange={() => handleChange(config.key, 'false')}
              className="text-ember-500 focus:ring-ember-500"
            />
            Onemogući
          </label>
          {isChanged && <span className="text-xs text-yellow-400">*izmenjeno</span>}
        </div>
      )
    }

    if (config.type === 'select' && config.options) {
      // Include current value even if it's not in the options list (robust against seeds/legacy values).
      const options = config.options.includes(value) || !value ? config.options : [value, ...config.options]
      return (
        <div className="flex items-center gap-3">
          <select
            value={value}
            onChange={(e) => handleChange(config.key, e.target.value)}
            className="rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'open'
                  ? 'Otvoren'
                  : opt === 'closed'
                    ? 'Zatvoren'
                    : opt === 'maintenance'
                      ? 'Održavanje'
                      : opt}
              </option>
            ))}
          </select>
          {isChanged && <span className="text-xs text-yellow-400">*izmenjeno</span>}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <input
          type={config.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleChange(config.key, e.target.value)}
          className="w-full max-w-xs rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
        />
        {config.suffix && <span className="text-sm text-white/60">{config.suffix}</span>}
        {isChanged && <span className="text-xs text-yellow-400">*izmenjeno</span>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-white/60">Učitavanje postavki…</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.03em] text-white">Postavke sistema</h1>
          <p className="mt-2 text-white/70">Konfiguriši osnovne parametre sajta</p>
        </div>

        {changedKeys.size > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1 disabled:opacity-50"
          >
            <CheckIcon className="h-5 w-5" />
            {saving ? 'Čuvanje…' : `Sačuvaj (${changedKeys.size})`}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
          {successMsg}
        </div>
      )}

      {/* Settings by group */}
      <div className="space-y-6">
        {(Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map((groupId) => {
          const groupSettings = SETTING_DEFINITIONS.filter((s) => s.group === groupId)
          const groupInfo = GROUPS[groupId]
          const Icon = groupInfo.Icon

          return (
            <div key={groupId} className="rounded-2xl border border-white/10 bg-[#111113]/70 p-6 backdrop-blur">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <Icon className="h-6 w-6 text-ember-500" />
                {groupInfo.name}
              </h2>

              <div className="grid gap-4">
                {groupSettings.map((config) => (
                  <div key={config.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                      <div className="flex-1">
                        <h3 className="mb-1 font-bold text-white">{config.label}</h3>
                        <p className="mb-3 text-sm text-white/60">{config.description}</p>
                        {renderInput(config)}
                      </div>
                      <div className="pt-1">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(config, editValues[config.key])}`}
                        >
                          {getDisplayValue(config, editValues[config.key])}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Important notes */}
      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
          <InformationCircleIcon className="h-5 w-5" />
          Važne napomene
        </h3>
        <ul className="space-y-2 text-sm text-yellow-200/90">
          <li>Promena postavki može uticati na funkcionalnost sajta.</li>
          <li>Minimalna porudžbina se primenjuje na ukupnu vrednost korpe.</li>
          <li>Promena statusa prodavnice može uticati na mogućnost poručivanja.</li>
          <li>Sve cene su u RSD (srpskim dinarima).</li>
          <li>Postavke koje ne postoje u bazi biće automatski kreirane pri čuvanju.</li>
        </ul>
      </div>
    </div>
  )
}
