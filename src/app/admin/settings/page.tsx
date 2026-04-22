'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

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
    label: 'Status shop-a',
    description: 'Status online prodavnice',
    type: 'select',
    group: 'shop',
    options: ['open', 'closed', 'maintenance']
  },
  {
    key: 'currency',
    label: 'Valuta',
    description: 'Valuta za cene',
    type: 'text',
    group: 'shop'
  },
  {
    key: 'min_order_amount',
    label: 'Minimalna porudzbina',
    description: 'Minimalna vrednost porudzbine',
    type: 'number',
    group: 'shop',
    suffix: 'RSD'
  },
  {
    key: 'low_stock_alert',
    label: 'Upozorenje za niske zalihe',
    description: 'Broj proizvoda kada se salje upozorenje',
    type: 'number',
    group: 'shop',
    suffix: 'kom'
  },
  {
    key: 'delivery_cost',
    label: 'Cena dostave',
    description: 'Standardna cena dostave',
    type: 'number',
    group: 'delivery',
    suffix: 'RSD'
  },
  {
    key: 'free_delivery_threshold',
    label: 'Besplatna dostava od',
    description: 'Vrednost porudzbine za besplatnu dostavu',
    type: 'number',
    group: 'delivery',
    suffix: 'RSD'
  },
  {
    key: 'payment_cod',
    label: 'Placanje pouzecem',
    description: 'Da li je omoguceno placanje pouzecem',
    type: 'boolean',
    group: 'payment'
  }
]

const GROUPS = {
  shop: { name: 'Prodavnica', icon: '\u2699\uFE0F' },
  delivery: { name: 'Dostava', icon: '\uD83D\uDE9A' },
  payment: { name: 'Placanje', icon: '\uD83D\uDCB3' }
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
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (!res.ok) throw new Error('Greska pri ucitavanju postavki')
      const data: DbSetting[] = await res.json()

      const map: Record<string, string> = {}
      for (const s of data) {
        map[s.key] = s.value
      }
      setSettings(map)
      setEditValues({ ...map })
      setChangedKeys(new Set())
    } catch (err: any) {
      setError(err.message || 'Greska pri ucitavanju')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }))
    const changed = new Set(changedKeys)
    if (value !== (settings[key] ?? '')) {
      changed.add(key)
    } else {
      changed.delete(key)
    }
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
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key, value: editValues[key] })
        })
        if (!res.ok) throw new Error(`Greska pri cuvanju: ${key}`)
      }

      setSettings({ ...editValues })
      setChangedKeys(new Set())
      setSuccessMsg('Postavke su uspesno sacuvane!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Greska pri cuvanju')
    } finally {
      setSaving(false)
    }
  }

  const getDisplayValue = (config: SettingConfig, value: string | undefined) => {
    const val = value ?? ''
    if (config.type === 'boolean') {
      return val === 'true' ? 'Omoguceno' : 'Onemoguceno'
    }
    if (config.type === 'select') {
      if (val === 'open') return 'Otvoren'
      if (val === 'closed') return 'Zatvoren'
      if (val === 'maintenance') return 'Odrzavanje'
      return val
    }
    if (config.type === 'number' && val === '0') return 'Nije ograniceno'
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
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="radio"
              checked={value === 'true'}
              onChange={() => handleChange(config.key, 'true')}
              className="text-ember-500 focus:ring-ember-500"
            />
            Omoguci
          </label>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="radio"
              checked={value !== 'true'}
              onChange={() => handleChange(config.key, 'false')}
              className="text-ember-500 focus:ring-ember-500"
            />
            Onemoguci
          </label>
          {isChanged && <span className="text-xs text-yellow-400">*izmenjeno</span>}
        </div>
      )
    }

    if (config.type === 'select' && config.options) {
      return (
        <div className="flex items-center gap-3">
          <select
            value={value}
            onChange={(e) => handleChange(config.key, e.target.value)}
            className="rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
          >
            <option value="">-- izaberi --</option>
            {config.options.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'open' ? 'Otvoren' : opt === 'closed' ? 'Zatvoren' : opt === 'maintenance' ? 'Odrzavanje' : opt}
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
        {config.suffix && <span className="text-white/60 text-sm">{config.suffix}</span>}
        {isChanged && <span className="text-xs text-yellow-400">*izmenjeno</span>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/60 text-lg">Ucitavanje postavki...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Postavke sistema</h1>
          <p className="mt-2 text-white/70">Konfigurisite osnovne parametre website-a</p>
        </div>

        {changedKeys.size > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1 disabled:opacity-50"
          >
            <CheckIcon className="h-5 w-5" />
            {saving ? 'Cuvanje...' : `Sacuvaj (${changedKeys.size})`}
          </button>
        )}
      </div>

      {/* Messages */}
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

      {/* Settings by Group */}
      <div className="space-y-6">
        {(Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map(groupId => {
          const groupSettings = SETTING_DEFINITIONS.filter(s => s.group === groupId)
          const groupInfo = GROUPS[groupId]

          return (
            <div key={groupId} className="rounded-2xl border border-white/10 bg-surface/50 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">{groupInfo.icon}</span>
                {groupInfo.name}
              </h2>

              <div className="grid gap-4">
                {groupSettings.map(config => (
                  <div key={config.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{config.label}</h3>
                        <p className="text-sm text-white/60 mb-3">{config.description}</p>
                        {renderInput(config)}
                      </div>
                      <div className="pt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(config, editValues[config.key])}`}>
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

      {/* Important Notes */}
      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">Vazne napomene</h3>
        <ul className="space-y-2 text-sm text-yellow-200">
          <li>Promena postavki moze uticati na funkcionalnost website-a</li>
          <li>Minimalna porudzbina se primenjuje na ukupnu vrednost korpe</li>
          <li>Promena statusa shop-a ce uticati na mogucnost porucivanja</li>
          <li>Sve cene su u RSD (srpskim dinarima)</li>
          <li>Postavke koje ne postoje u bazi ce biti automatski kreirane pri cuvanju</li>
        </ul>
      </div>
    </div>
  )
}
