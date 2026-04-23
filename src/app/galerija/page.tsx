'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface GalleryImage {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  featured: boolean
  sortOrder: number
  createdAt: string
}

const CATEGORIES = [
  { key: 'all', label: 'Sve' },
  { key: 'events', label: 'Događaji' },
  { key: 'products', label: 'Proizvodi' },
  { key: 'food', label: 'Hrana' },
  { key: 'customers', label: 'Korisnici' },
]

const PLACEHOLDER_COLORS = [
  'from-ember-500/30 to-fire-500/20',
  'from-warning-500/30 to-ember-500/20',
  'from-fire-500/30 to-red-900/20',
  'from-amber-600/30 to-ember-500/20',
  'from-orange-500/30 to-red-600/20',
  'from-red-500/30 to-amber-700/20',
]

export default function GalerijaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    const url = activeCategory === 'all'
      ? '/api/gallery'
      : `/api/gallery?category=${activeCategory}`

    setLoading(true)
    fetch(url)
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch gallery')
      })
      .then((data: GalleryImage[]) => {
        setImages(data)
      })
      .catch((err) => {
        console.error('Error fetching gallery:', err)
        setImages([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Dotted Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
                Galerija
              </p>
              <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
                Naše Slike
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-white/80 leading-relaxed">
                Pogledajte naše proizvode, događaje, jela i ljude koji čine SmokHot zajednicu.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="border-b border-white/8 py-6">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
                    activeCategory === cat.key
                      ? 'bg-ember-500 text-white'
                      : 'border border-white/20 text-white/70 hover:text-white hover:border-ember-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
                  <p className="text-white/60">Učitavanje galerije...</p>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-white/70 mb-2">
                  Galerija je prazna. Dodajte slike kroz admin panel.
                </p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {images.map((image, index) => {
                  const colorClass = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
                  // Vary heights for masonry effect
                  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60']
                  const heightClass = heights[index % heights.length]

                  return (
                    <div
                      key={image.id}
                      className="break-inside-avoid cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className={`rounded-3xl border border-white/10 overflow-hidden transition hover:border-ember-500/50 hover:-translate-y-1`}>
                        {image.imageUrl ? (
                          <img loading="lazy" decoding="async"
                            src={image.imageUrl}
                            alt={image.title}
                            className={`w-full ${heightClass} object-cover`}
                          />
                        ) : (
                          <div className={`w-full ${heightClass} bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center p-6`}>
                            <span className="text-4xl mb-3 opacity-50">
                              {image.category === 'products' ? '🌶️' :
                               image.category === 'events' ? '🎪' :
                               image.category === 'food' ? '🍽️' :
                               image.category === 'customers' ? '🤘' : '📷'}
                            </span>
                            <span className="text-sm text-white/40 font-bold uppercase tracking-wider">
                              {image.title}
                            </span>
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-3xl flex items-end">
                          <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                            <h3 className="text-sm font-bold text-white">{image.title}</h3>
                            {image.description && (
                              <p className="text-xs text-white/70 mt-1 line-clamp-2">{image.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          <div
            className="max-w-4xl w-full rounded-3xl border border-white/10 bg-surface overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImage.imageUrl ? (
              <img loading="lazy" decoding="async"
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full max-h-[60vh] object-contain bg-black"
              />
            ) : (
              <div className={`w-full h-64 sm:h-96 bg-gradient-to-br ${PLACEHOLDER_COLORS[0]} flex items-center justify-center`}>
                <span className="text-8xl opacity-30">
                  {selectedImage.category === 'products' ? '🌶️' :
                   selectedImage.category === 'events' ? '🎪' :
                   selectedImage.category === 'food' ? '🍽️' :
                   selectedImage.category === 'customers' ? '🤘' : '📷'}
                </span>
              </div>
            )}

            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mb-2 inline-block rounded-full bg-ember-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ember-500">
                    {CATEGORIES.find(c => c.key === selectedImage.category)?.label || selectedImage.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-2">{selectedImage.title}</h2>
                  {selectedImage.description && (
                    <p className="mt-2 text-white/70">{selectedImage.description}</p>
                  )}
                </div>
                {selectedImage.featured && (
                  <span className="rounded-full bg-warning-500/20 px-3 py-1 text-xs font-bold text-warning-500">
                    Istaknuto
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
