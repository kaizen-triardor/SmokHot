'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline'

interface ContentEntry {
  id: string
  key: string
  title: string
  content: string
  type: string
  section: string
  createdAt: string
  updatedAt: string
}

const SECTION_LABELS: Record<string, { name: string; icon: string }> = {
  hero: { name: 'Pocetna strana (Hero)', icon: '\uD83C\uDFE0' },
  about: { name: 'O nama', icon: '\uD83D\uDCDD' },
  contact: { name: 'Kontakt', icon: '\uD83D\uDCDE' },
  global: { name: 'Globalno', icon: '\uD83C\uDF10' }
}

export default function ContentAdmin() {
  const [entries, setEntries] = useState<ContentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    key: '',
    title: '',
    content: '',
    type: 'text',
    section: 'global'
  })

  const getToken = () => localStorage.getItem('admin-token')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getToken()
      const res = await fetch('/api/admin/content', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (!res.ok) throw new Error('Greska pri ucitavanju sadrzaja')
      const data: ContentEntry[] = await res.json()
      setEntries(data)
    } catch (err: any) {
      setError(err.message || 'Greska pri ucitavanju')
    } finally {
      setLoading(false)
    }
  }

  // JSON field labels for known keys
  const JSON_FIELD_LABELS: Record<string, Record<string, string>> = {
    contact_info: {
      phone: 'Telefon',
      email: 'Email',
      address: 'Adresa',
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      working_hours: 'Radno vreme',
    },
    social_links: {
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      youtube: 'YouTube',
    }
  }

  const [jsonFields, setJsonFields] = useState<Record<string, string>>({})

  const startEdit = (entry: ContentEntry) => {
    setEditingKey(entry.key)
    setEditContent(entry.content)
    setEditTitle(entry.title)

    // Parse JSON content into individual fields
    if (entry.type === 'json') {
      try {
        const parsed = JSON.parse(entry.content)
        if (typeof parsed === 'object' && parsed !== null) {
          const fields: Record<string, string> = {}
          for (const [k, v] of Object.entries(parsed)) {
            fields[k] = String(v)
          }
          setJsonFields(fields)
        }
      } catch {
        setJsonFields({})
      }
    }
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditContent('')
    setEditTitle('')
    setJsonFields({})
  }

  const updateJsonField = (fieldKey: string, value: string) => {
    setJsonFields(prev => {
      const updated = { ...prev, [fieldKey]: value }
      // Sync back to editContent as JSON string
      setEditContent(JSON.stringify(updated))
      return updated
    })
  }

  const addJsonField = () => {
    const key = prompt('Naziv polja (npr. website, twitter):')
    if (key && key.trim()) {
      updateJsonField(key.trim(), '')
    }
  }

  const removeJsonField = (fieldKey: string) => {
    setJsonFields(prev => {
      const updated = { ...prev }
      delete updated[fieldKey]
      setEditContent(JSON.stringify(updated))
      return updated
    })
  }

  const saveEdit = async () => {
    if (!editingKey) return
    setSaving(true)
    setError(null)

    // For JSON type, reconstruct content from fields
    const entry = entries.find(e => e.key === editingKey)
    let contentToSave = editContent
    if (entry?.type === 'json' && Object.keys(jsonFields).length > 0) {
      contentToSave = JSON.stringify(jsonFields)
    }

    try {
      const token = getToken()
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: editingKey,
          content: contentToSave,
          title: editTitle
        })
      })
      if (!res.ok) throw new Error('Greska pri cuvanju')

      const updated: ContentEntry = await res.json()
      setEntries(prev => prev.map(e => e.key === editingKey ? updated : e))
      setEditingKey(null)
      setJsonFields({})
      setSuccessMsg('Sadrzaj je uspesno sacuvan!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Greska pri cuvanju')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!newEntry.key || !newEntry.title) {
      setError('Kljuc i naslov su obavezni')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const token = getToken()
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Greska pri kreiranju')
      }

      const created: ContentEntry = await res.json()
      setEntries(prev => [...prev, created])
      setNewEntry({ key: '', title: '', content: '', type: 'text', section: 'global' })
      setShowCreateForm(false)
      setSuccessMsg('Sadrzaj je uspesno kreiran!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Greska pri kreiranju')
    } finally {
      setSaving(false)
    }
  }

  const groupedEntries = entries.reduce<Record<string, ContentEntry[]>>((acc, entry) => {
    const section = entry.section || 'global'
    if (!acc[section]) acc[section] = []
    acc[section].push(entry)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/60 text-lg">Ucitavanje sadrzaja...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upravljanje sadrzajem</h1>
          <p className="mt-2 text-white/70">Uredite tekstove, naslove i opise na website-u</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 rounded-xl border-2 border-ember-500 bg-ember-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
        >
          <PlusIcon className="h-5 w-5" />
          Novi sadrzaj
        </button>
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

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 rounded-2xl border border-ember-500/30 bg-surface/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Kreiraj novi sadrzaj</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Kljuc (key)</label>
              <input
                type="text"
                value={newEntry.key}
                onChange={e => setNewEntry(prev => ({ ...prev, key: e.target.value }))}
                placeholder="npr. hero_title"
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white placeholder-white/40 focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Naslov</label>
              <input
                type="text"
                value={newEntry.title}
                onChange={e => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Citljiv naziv"
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white placeholder-white/40 focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Sekcija</label>
              <select
                value={newEntry.section}
                onChange={e => setNewEntry(prev => ({ ...prev, section: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
              >
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Tip</label>
              <select
                value={newEntry.type}
                onChange={e => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
              >
                <option value="text">Tekst</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-white mb-2">Sadrzaj</label>
              {newEntry.type === 'json' ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/40 mb-2">Za JSON tip, unesite polja u formatu: svako polje u novom redu kao &quot;naziv: vrednost&quot;</p>
                  <textarea
                    value={newEntry.content}
                    onChange={e => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    placeholder={'phone: +381 60 123 4567\nemail: info@smokhot.rs\ninstagram: @smokhot\nfacebook: SmokinHotSrbija'}
                    className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/40 font-mono text-sm focus:border-ember-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Convert simple "key: value" lines to JSON
                      const lines = newEntry.content.split('\n').filter(l => l.includes(':'))
                      const obj: Record<string, string> = {}
                      for (const line of lines) {
                        const idx = line.indexOf(':')
                        const k = line.substring(0, idx).trim()
                        const v = line.substring(idx + 1).trim()
                        if (k) obj[k] = v
                      }
                      setNewEntry(prev => ({ ...prev, content: JSON.stringify(obj) }))
                    }}
                    className="text-xs text-ember-400 hover:text-ember-300"
                  >
                    Konvertuj u JSON format
                  </button>
                </div>
              ) : (
                <textarea
                  value={newEntry.content}
                  onChange={e => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  placeholder="Unesite sadrzaj..."
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/40 focus:border-ember-500 focus:outline-none"
                />
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="rounded-xl border-2 border-green-500 bg-green-500 px-6 py-2 font-bold text-white transition hover:-translate-y-1 disabled:opacity-50"
            >
              {saving ? 'Cuvanje...' : 'Kreiraj'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-xl border-2 border-white/20 px-6 py-2 font-bold text-white transition hover:bg-white/5"
            >
              Otkazi
            </button>
          </div>
        </div>
      )}

      {/* Content by Section */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-12 text-center">
          <div className="text-4xl mb-4">{'\uD83D\uDCDD'}</div>
          <h2 className="text-xl font-bold text-white mb-2">Nema sadrzaja u bazi</h2>
          <p className="text-white/60 mb-6">
            Koristite dugme &quot;Novi sadrzaj&quot; da dodate prvi unos, ili pokrenite seed skriptu za inicijalne podatke.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(SECTION_LABELS).map(([sectionKey, sectionInfo]) => {
            const sectionEntries = groupedEntries[sectionKey]
            if (!sectionEntries || sectionEntries.length === 0) return null

            return (
              <div key={sectionKey} className="rounded-2xl border border-white/10 bg-surface/50 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">{sectionInfo.icon}</span>
                  {sectionInfo.name}
                  <span className="text-sm font-normal text-white/40 ml-2">({sectionEntries.length})</span>
                </h2>

                <div className="grid gap-4">
                  {sectionEntries.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      {editingKey === entry.key ? (
                        /* Edit mode */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-bold text-white mb-1">Naslov</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
                            />
                          </div>

                          {/* Smart edit: JSON gets individual fields, text/html gets textarea */}
                          {entry.type === 'json' && Object.keys(jsonFields).length > 0 ? (
                            <div className="space-y-3">
                              <label className="block text-sm font-bold text-white">Polja</label>
                              {Object.entries(jsonFields).map(([fieldKey, fieldValue]) => {
                                const labels = JSON_FIELD_LABELS[entry.key] || {}
                                const label = labels[fieldKey] || fieldKey
                                return (
                                  <div key={fieldKey} className="flex items-center gap-3">
                                    <label className="w-32 text-sm text-white/70 flex-shrink-0">{label}</label>
                                    <input
                                      type="text"
                                      value={fieldValue}
                                      onChange={e => updateJsonField(fieldKey, e.target.value)}
                                      className="flex-1 rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-white focus:border-ember-500 focus:outline-none"
                                      placeholder={label}
                                    />
                                    <button
                                      onClick={() => removeJsonField(fieldKey)}
                                      className="p-2 text-red-400 hover:text-red-300 transition flex-shrink-0"
                                      title="Ukloni polje"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                )
                              })}
                              <button
                                onClick={addJsonField}
                                className="text-sm text-ember-400 hover:text-ember-300 transition"
                              >
                                + Dodaj polje
                              </button>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-bold text-white mb-1">Sadrzaj</label>
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={entry.type === 'html' ? 8 : entry.content.length > 100 ? 5 : 2}
                                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white font-mono text-sm focus:border-ember-500 focus:outline-none"
                              />
                              {entry.type === 'html' && (
                                <p className="mt-1 text-xs text-white/40">HTML format - možete koristiti tagove kao &lt;b&gt;, &lt;p&gt;, &lt;br&gt;</p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-500 px-4 py-2 font-bold text-white transition hover:-translate-y-1 disabled:opacity-50"
                            >
                              <CheckIcon className="h-4 w-4" />
                              {saving ? 'Cuvanje...' : 'Sacuvaj'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-xl border-2 border-white/20 px-4 py-2 font-bold text-white transition hover:bg-white/5"
                            >
                              Otkazi
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display mode */
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                              <span className="text-xs text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded">{entry.key}</span>
                            </div>

                            {/* Smart display for JSON */}
                            {entry.type === 'json' ? (() => {
                              try {
                                const parsed = JSON.parse(entry.content)
                                if (typeof parsed === 'object' && parsed !== null) {
                                  const labels = JSON_FIELD_LABELS[entry.key] || {}
                                  return (
                                    <div className="grid gap-1.5">
                                      {Object.entries(parsed).map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-2 text-sm">
                                          <span className="text-white/50 w-28 flex-shrink-0">{labels[k] || k}:</span>
                                          <span className="text-white/80">{String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                }
                              } catch { /* fall through */ }
                              return <div className="text-white/80 break-words font-mono text-sm">{entry.content}</div>
                            })() : (
                              <div className="text-white/80 break-words">
                                {entry.content.length > 200
                                  ? entry.content.substring(0, 200) + '...'
                                  : entry.content}
                              </div>
                            )}

                            <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                              <span>Tip: {entry.type}</span>
                              <span>Ažurirano: {new Date(entry.updatedAt).toLocaleDateString('sr-RS')}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => startEdit(entry)}
                            className="ml-4 p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition flex-shrink-0"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Entries in unknown sections */}
          {Object.entries(groupedEntries)
            .filter(([key]) => !SECTION_LABELS[key])
            .map(([sectionKey, sectionEntries]) => (
              <div key={sectionKey} className="rounded-2xl border border-white/10 bg-surface/50 p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Sekcija: {sectionKey}
                  <span className="text-sm font-normal text-white/40 ml-2">({sectionEntries.length})</span>
                </h2>
                <div className="grid gap-4">
                  {sectionEntries.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1">{entry.title}</h3>
                          <div className="text-white/80 break-words">
                            {entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
                          </div>
                        </div>
                        <button
                          onClick={() => startEdit(entry)}
                          className="ml-4 p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition flex-shrink-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
