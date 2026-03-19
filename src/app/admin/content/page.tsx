'use client'

import { useState } from 'react'
import { PencilIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ContentSection {
  id: string
  name: string
  title: string
  content: string
  type: 'text' | 'html' | 'image'
  editable: boolean
}

export default function ContentAdmin() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    {
      id: 'hero-title',
      name: 'Hero naslov',
      title: 'SMOKIN\' HOT COLLECTIVE',
      content: 'SMOKIN\' HOT COLLECTIVE',
      type: 'text',
      editable: true
    },
    {
      id: 'hero-subtitle',
      name: 'Hero podnaslov',
      title: 'Srpski ljuti sosovi',
      content: 'Srpski ljuti sosovi',
      type: 'text',
      editable: true
    },
    {
      id: 'hero-description',
      name: 'Hero opis',
      title: 'Glavna poruka na početnoj strani',
      content: 'Mi smo buntovnici koji su zapalili revoluciju ukusa u Srbiji. Svaki sos je pokret otpora protiv bljutavih jela.',
      type: 'text',
      editable: true
    },
    {
      id: 'about-section-title',
      name: 'O nama naslov',
      title: 'Nismo za svakoga',
      content: 'Nismo za svakoga',
      type: 'text',
      editable: true
    },
    {
      id: 'about-section-content',
      name: 'O nama sadržaj',
      title: 'Opis brenda u "Nismo za svakoga" sekciji',
      content: 'Smokin\' Hot nije još jedan generičan food shop. Brend treba da deluje kao spoj garažnog benda, male craft radionice i ozbiljne ljubavi prema paprici. Vizuelno je glasan, ali UX mora da ostane čist, jasan i prodajan.',
      type: 'text',
      editable: true
    },
    {
      id: 'contact-phone',
      name: 'Kontakt telefon',
      title: '+381 60 123 4567',
      content: '+381 60 123 4567',
      type: 'text',
      editable: true
    },
    {
      id: 'contact-email',
      name: 'Kontakt email',
      title: 'info@smokhot.rs',
      content: 'info@smokhot.rs',
      type: 'text',
      editable: true
    },
    {
      id: 'social-instagram',
      name: 'Instagram handle',
      title: '@smokinhot.rs',
      content: '@smokinhot.rs',
      type: 'text',
      editable: true
    },
    {
      id: 'social-facebook',
      name: 'Facebook naziv',
      title: 'Smokin\' Hot',
      content: 'Smokin\' Hot',
      type: 'text',
      editable: true
    },
    {
      id: 'social-tiktok',
      name: 'TikTok handle',
      title: '@smokinhot.rs',
      content: '@smokinhot.rs',
      type: 'text',
      editable: true
    }
  ])

  const [editingSection, setEditingSection] = useState<ContentSection | null>(null)

  const handleEdit = (section: ContentSection) => {
    setEditingSection({ ...section })
  }

  const handleSave = (updatedSection: ContentSection) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      )
    )
    setEditingSection(null)
  }

  const ContentEditModal = ({ section, onSave, onCancel }: {
    section: ContentSection,
    onSave: (section: ContentSection) => void,
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      title: section.title,
      content: section.content
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave({
        ...section,
        title: formData.title,
        content: formData.content
      })
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-6">Uredi sadržaj: {section.name}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Naslov</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Sadržaj</label>
              {section.type === 'text' ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={section.content.length > 100 ? 6 : 3}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
              >
                Sačuvaj
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border-2 border-white/20 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upravljanje sadržajem</h1>
        <p className="mt-2 text-white/70">Uredi tekstove, naslove i opise na website-u</p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Homepage Sections */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🏠 Početna strana
          </h2>
          
          <div className="grid gap-6">
            {contentSections.filter(section => 
              ['hero-title', 'hero-subtitle', 'hero-description', 'about-section-title', 'about-section-content'].includes(section.id)
            ).map((section) => (
              <div key={section.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{section.name}</h3>
                    <div className="text-white/80 break-words">
                      {section.content.length > 150 
                        ? section.content.substring(0, 150) + '...'
                        : section.content
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(section)}
                    className="ml-4 p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📞 Kontakt informacije
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {contentSections.filter(section => 
              ['contact-phone', 'contact-email'].includes(section.id)
            ).map((section) => (
              <div key={section.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white/80 mb-1">{section.name}</h3>
                    <div className="text-white font-medium">{section.content}</div>
                  </div>
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📱 Društvene mreže
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {contentSections.filter(section => 
              ['social-instagram', 'social-facebook', 'social-tiktok'].includes(section.id)
            ).map((section) => (
              <div key={section.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white/80 mb-1">{section.name}</h3>
                    <div className="text-white font-medium">{section.content}</div>
                  </div>
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images & Media */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🖼️ Slike i mediji
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Logo', path: '/SmokHotLogo.png', type: 'Glavni logo' },
              { name: 'Hero slika', path: '/images/hero-bg.jpg', type: 'Pozadina' },
              { name: 'Proizvodi', path: '/images/products/', type: 'Folder' }
            ].map((media, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-ember-500/20 to-fire-500/20 flex items-center justify-center">
                    <PhotoIcon className="h-6 w-6 text-ember-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{media.name}</h3>
                    <p className="text-sm text-white/60">{media.type}</p>
                    <p className="text-xs text-white/40 font-mono">{media.path}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 text-xs bg-ember-500/20 text-ember-400 px-3 py-2 rounded-lg hover:bg-ember-500 hover:text-white transition">
                    Zameni
                  </button>
                  <button className="flex-1 text-xs bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                    Pregled
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-sm text-yellow-400">
              <span className="font-bold">Napomena:</span> Upload slika će biti implementiran u narednoj verziji. 
              Trenutno možete zameniti slike direktno u <code className="bg-black/20 px-1 rounded">/public</code> folder-u.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <ContentEditModal
          section={editingSection}
          onSave={handleSave}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  )
}