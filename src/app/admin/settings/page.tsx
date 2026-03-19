'use client'

import { useState } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Setting {
  id: string
  category: string
  name: string
  description: string
  value: string | boolean | number
  type: 'text' | 'boolean' | 'number' | 'select'
  options?: string[]
}

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'site-name',
      category: 'general',
      name: 'Naziv sajta',
      description: 'Naziv koji se prikazuje u browser tab-u',
      value: 'SmokHot - Srpski Ljuti Sosovi',
      type: 'text'
    },
    {
      id: 'site-description',
      category: 'general',
      name: 'Opis sajta',
      description: 'Meta opis za SEO',
      value: 'Srbijni proizvođač autentičnih ljutih sosova. Domaći ljuti sosovi sa karakterom.',
      type: 'text'
    },
    {
      id: 'contact-phone',
      category: 'contact',
      name: 'Kontakt telefon',
      description: 'Glavni broj telefona',
      value: '+381 60 123 4567',
      type: 'text'
    },
    {
      id: 'contact-email',
      category: 'contact',
      name: 'Kontakt email',
      description: 'Email adresa za kontakt',
      value: 'info@smokhot.rs',
      type: 'text'
    },
    {
      id: 'order-email',
      category: 'orders',
      name: 'Email za porudžbine',
      description: 'Email na koji se šalju nova porudžbina',
      value: 'kaizen.triardor@gmail.com',
      type: 'text'
    },
    {
      id: 'min-order-amount',
      category: 'orders',
      name: 'Minimalna porudžbina',
      description: 'Minimalna vrednost porudžbine u RSD',
      value: 0,
      type: 'number'
    },
    {
      id: 'free-shipping-threshold',
      category: 'shipping',
      name: 'Besplatna dostava od',
      description: 'Vrednost porudžbine za besplatnu dostavu (RSD)',
      value: 3000,
      type: 'number'
    },
    {
      id: 'shipping-cost',
      category: 'shipping',
      name: 'Cena dostave',
      description: 'Standardna cena dostave u RSD',
      value: 300,
      type: 'number'
    },
    {
      id: 'cod-enabled',
      category: 'payment',
      name: 'Plaćanje pouzećem',
      description: 'Da li je omogućeno plaćanje pouzećem',
      value: true,
      type: 'boolean'
    },
    {
      id: 'card-payment-enabled',
      category: 'payment',
      name: 'Plaćanje karticama',
      description: 'Da li je omogućeno plaćanje karticama',
      value: false,
      type: 'boolean'
    },
    {
      id: 'shop-status',
      category: 'general',
      name: 'Status shop-a',
      description: 'Status online prodavnice',
      value: 'open',
      type: 'select',
      options: ['open', 'closed', 'maintenance']
    },
    {
      id: 'inventory-tracking',
      category: 'inventory',
      name: 'Praćenje zaliha',
      description: 'Da li se prate zalihe proizvoda',
      value: false,
      type: 'boolean'
    },
    {
      id: 'low-stock-threshold',
      category: 'inventory',
      name: 'Upozorenje za niske zalihe',
      description: 'Broj proizvoda kada se šalje upozorenje',
      value: 5,
      type: 'number'
    }
  ])

  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const categories = {
    general: { name: 'Opšte postavke', icon: '⚙️' },
    contact: { name: 'Kontakt informacije', icon: '📞' },
    orders: { name: 'Porudžbine', icon: '📦' },
    shipping: { name: 'Dostava', icon: '🚚' },
    payment: { name: 'Plaćanje', icon: '💳' },
    inventory: { name: 'Zalihe', icon: '📊' }
  }

  const handleEdit = (setting: Setting) => {
    setEditingSetting({ ...setting })
  }

  const handleSave = (updatedSetting: Setting) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === updatedSetting.id ? updatedSetting : setting
      )
    )
    setEditingSetting(null)
    setHasChanges(true)
  }

  const handleSaveAll = () => {
    // Here you would save to database/API
    console.log('Saving all settings:', settings)
    setHasChanges(false)
    alert('Postavke su uspešno sačuvane!')
  }

  const getStatusColor = (value: any, type: string) => {
    if (type === 'boolean') {
      return value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }
    if (type === 'select' && value === 'open') {
      return 'bg-green-500/20 text-green-400'
    }
    if (type === 'select' && value === 'closed') {
      return 'bg-red-500/20 text-red-400'
    }
    if (type === 'select' && value === 'maintenance') {
      return 'bg-yellow-500/20 text-yellow-400'
    }
    return 'bg-blue-500/20 text-blue-400'
  }

  const SettingEditModal = ({ setting, onSave, onCancel }: {
    setting: Setting,
    onSave: (setting: Setting) => void,
    onCancel: () => void
  }) => {
    const [formValue, setFormValue] = useState(setting.value)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave({
        ...setting,
        value: formValue
      })
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-2xl border border-white/10 p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-white mb-4">Uredi postavku</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">{setting.name}</label>
              <p className="text-sm text-white/60 mb-3">{setting.description}</p>
              
              {setting.type === 'text' && (
                <input
                  type="text"
                  value={formValue as string}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                />
              )}
              
              {setting.type === 'number' && (
                <input
                  type="number"
                  value={formValue as number}
                  onChange={(e) => setFormValue(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                />
              )}
              
              {setting.type === 'boolean' && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      checked={formValue === true}
                      onChange={() => setFormValue(true)}
                      className="text-ember-500 focus:ring-ember-500"
                    />
                    Omogući
                  </label>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      checked={formValue === false}
                      onChange={() => setFormValue(false)}
                      className="text-ember-500 focus:ring-ember-500"
                    />
                    Onemogući
                  </label>
                </div>
              )}
              
              {setting.type === 'select' && setting.options && (
                <select
                  value={formValue as string}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                >
                  {setting.options.map((option) => (
                    <option key={option} value={option}>
                      {option === 'open' && 'Otvoren'}
                      {option === 'closed' && 'Zatvoren'}
                      {option === 'maintenance' && 'Održavanje'}
                      {!['open', 'closed', 'maintenance'].includes(option) && option}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold text-white transition hover:-translate-y-1"
              >
                Sačuvaj
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border-2 border-white/20 py-3 font-bold text-white transition hover:bg-white/5"
              >
                Otkaži
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Postavke sistema</h1>
          <p className="mt-2 text-white/70">Konfiguriši osnovne parametre website-a</p>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
          >
            <CheckIcon className="h-5 w-5" />
            Sačuvaj sve
          </button>
        )}
      </div>

      {/* Settings by Category */}
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryId, categoryInfo]) => {
          const categorySettings = settings.filter(s => s.category === categoryId)
          
          if (categorySettings.length === 0) return null
          
          return (
            <div key={categoryId} className="rounded-2xl border border-white/10 bg-surface/50 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">{categoryInfo.icon}</span>
                {categoryInfo.name}
              </h2>
              
              <div className="grid gap-4">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{setting.name}</h3>
                        <p className="text-sm text-white/60 mb-3">{setting.description}</p>
                        
                        <div className="flex items-center gap-3">
                          {setting.type === 'boolean' ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(setting.value, setting.type)}`}>
                              {setting.value ? 'Omogućeno' : 'Onemogućeno'}
                            </span>
                          ) : setting.type === 'select' ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(setting.value, setting.type)}`}>
                              {setting.value === 'open' && 'Otvoren'}
                              {setting.value === 'closed' && 'Zatvoren'}  
                              {setting.value === 'maintenance' && 'Održavanje'}
                            </span>
                          ) : (
                            <span className="text-white font-medium">
                              {setting.type === 'number' && setting.value === 0 
                                ? 'Nije ograničeno' 
                                : setting.value.toString()
                              }
                              {setting.type === 'number' && setting.value > 0 && setting.id.includes('amount') && ' RSD'}
                              {setting.type === 'number' && setting.value > 0 && setting.id.includes('cost') && ' RSD'}
                              {setting.type === 'number' && setting.value > 0 && setting.id.includes('threshold') && ' kom'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleEdit(setting)}
                        className="ml-4 p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                      >
                        ⚙️
                      </button>
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
        <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
          ⚠️ Važne napomene
        </h3>
        <ul className="space-y-2 text-sm text-yellow-200">
          <li>• Promena postavki može uticati na funkcionalnost website-a</li>
          <li>• Email za porudžbine mora biti validan za prijem notifikacija</li>
          <li>• Minimalna porudžbina se primenjuje na ukupnu vrednost korpe</li>
          <li>• Promena statusa shop-a će uticati na mogućnost poručivanja</li>
          <li>• Sve cene su u RSD (srpskim dinarima)</li>
        </ul>
      </div>

      {/* Edit Modal */}
      {editingSetting && (
        <SettingEditModal
          setting={editingSetting}
          onSave={handleSave}
          onCancel={() => setEditingSetting(null)}
        />
      )}
    </div>
  )
}