'use client'

import React, { useState, useEffect } from 'react'
import { TrashIcon, PlusIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface GalleryImage {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { key: 'all', label: 'Sve' },
  { key: 'general', label: 'Opšte' },
  { key: 'events', label: 'Događaji' },
  { key: 'products', label: 'Proizvodi' },
  { key: 'food', label: 'Hrana' },
  { key: 'customers', label: 'Korisnici' },
]

const emptyImage = {
  title: '',
  description: '',
  imageUrl: '',
  category: 'general',
  featured: false,
  sortOrder: 0,
}

export default function AdminGalerijaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyImage)
  const [activeCategory, setActiveCategory] = useState('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const getToken = () => localStorage.getItem('admin-token') || ''

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/gallery', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      }
    } catch (err) {
      console.error('Failed to fetch images:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleCreate = () => {
    setFormData({ ...emptyImage, sortOrder: images.length })
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu sliku?')) return

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        setImages(images.filter(img => img.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete image:', err)
    }
  }

  const toggleFeatured = async (image: GalleryImage) => {
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          ...image,
          featured: !image.featured,
        })
      })
      if (res.ok) {
        setImages(images.map(img =>
          img.id === image.id ? { ...img, featured: !img.featured } : img
        ))
      }
    } catch (err) {
      console.error('Failed to update image:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowForm(false)
        fetchImages()
      } else {
        const data = await res.json()
        setError(data.error || 'Greška prilikom čuvanja')
      }
    } catch (err) {
      setError('Greška prilikom čuvanja')
    } finally {
      setSaving(false)
    }
  }

  const filteredImages = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory)

  if (loading) {
    return <div className="text-white/60">Učitavanje galerije...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Galerija</h1>
          <p className="mt-1 text-white/60">Upravljajte slikama u galeriji</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-ember-500 px-4 py-2 font-bold text-white transition hover:bg-ember-600"
        >
          <PlusIcon className="h-5 w-5" />
          Nova slika
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeCategory === cat.key
                ? 'bg-ember-500 text-white'
                : 'border border-white/20 text-white/60 hover:text-white hover:border-white/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-surface p-12 text-center">
          <p className="text-white/50 text-lg mb-4">Nema slika u galeriji</p>
          <button
            onClick={handleCreate}
            className="text-ember-500 font-bold hover:underline"
          >
            Dodajte prvu sliku
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="rounded-3xl border border-white/10 bg-surface overflow-hidden group"
            >
              {/* Image Preview */}
              {image.imageUrl ? (
                <div className="h-40 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-ember-500/20 to-fire-500/10 flex items-center justify-center">
                  <span className="text-4xl opacity-30">📷</span>
                </div>
              )}

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{image.title}</h3>
                    <span className="inline-block mt-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                      {CATEGORIES.find(c => c.key === image.category)?.label || image.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleFeatured(image)}
                      className="rounded-lg p-1.5 text-white/40 hover:text-warning-500 transition"
                      title={image.featured ? 'Ukloni iz istaknutih' : 'Istakni'}
                    >
                      {image.featured ? (
                        <StarSolidIcon className="h-4 w-4 text-warning-500" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="rounded-lg p-1.5 text-white/40 hover:text-red-400 transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {image.description && (
                  <p className="mt-2 text-xs text-white/40 line-clamp-2">{image.description}</p>
                )}
                <p className="mt-2 text-xs text-white/30">Redosled: {image.sortOrder}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-16">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0b0d] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Nova slika</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Naslov *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="Naziv slike"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">URL slike *</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="https://primer.com/slika.jpg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Opis</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="Kratak opis slike"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Kategorija</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                >
                  <option value="general">Opšte</option>
                  <option value="events">Događaji</option>
                  <option value="products">Proizvodi</option>
                  <option value="food">Hrana</option>
                  <option value="customers">Korisnici</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Redosled</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-white/40">Manji broj = prikazuje se ranije</p>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative h-7 w-12 rounded-full transition ${
                    formData.featured ? 'bg-ember-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData.featured ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-white">
                  {formData.featured ? 'Istaknuta' : 'Nije istaknuta'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-ember-500 px-6 py-3 font-bold text-white transition hover:bg-ember-600 disabled:opacity-50"
                >
                  {saving ? 'Čuvanje...' : 'Dodaj sliku'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white/70 transition hover:text-white hover:border-white/40"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
