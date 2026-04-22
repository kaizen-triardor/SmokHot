'use client'

import React, { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/admin/ImageUpload'
import { useConfirm } from '@/components/admin/ConfirmModal'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string | null
  published: boolean
  author: string
  tags: string | null
  createdAt: string
  updatedAt: string
}

const emptyPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: null,
  published: false,
  author: 'SmokHot',
  tags: null,
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState(emptyPost)
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const getToken = () => localStorage.getItem('admin-token') || ''

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreate = () => {
    setEditingPost(null)
    setFormData(emptyPost)
    setTagsInput('')
    setShowForm(true)
    setError('')
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      published: post.published,
      author: post.author,
      tags: post.tags,
    })
    setTagsInput(post.tags ? JSON.parse(post.tags).join(', ') : '')
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj post?')) return

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const tags = tagsInput
      ? JSON.stringify(tagsInput.split(',').map(t => t.trim()).filter(Boolean))
      : null

    const payload = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      tags,
    }

    try {
      const url = editingPost
        ? `/api/admin/blog/${editingPost.id}`
        : '/api/admin/blog'

      const res = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowForm(false)
        fetchPosts()
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-white/60">Učitavanje blog postova...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog</h1>
          <p className="mt-1 text-white/60">Upravljajte blog postovima</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-ember-500 px-4 py-2 font-bold text-white transition hover:bg-ember-600"
        >
          <PlusIcon className="h-5 w-5" />
          Novi post
        </button>
      </div>

      {/* Post List */}
      {posts.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-white/10 bg-surface p-12 text-center">
          <p className="text-white/50 text-lg mb-4">Nema blog postova</p>
          <button
            onClick={handleCreate}
            className="text-ember-500 font-bold hover:underline"
          >
            Kreirajte prvi post
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white/60">Naslov</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white/60">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white/60">Datum</th>
                <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-white/60">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-white">{post.title}</p>
                      <p className="text-sm text-white/50 mt-1">/blog/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      post.published
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {post.published ? 'Objavljeno' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-lg p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-16">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b0b0d] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingPost ? 'Uredi post' : 'Novi post'}
              </h2>
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
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: editingPost ? formData.slug : generateSlug(e.target.value)
                    })
                  }}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="Naslov blog posta"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="url-slug-posta"
                />
                <p className="mt-1 text-xs text-white/40">Automatski generisan iz naslova</p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Kratak opis *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="Kratak tekst koji se prikazuje na listi postova"
                />
              </div>

              {/* Content with tabs: Edit / Preview */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-white">Sadržaj *</label>
                  <div className="flex rounded-lg border border-white/15 bg-black/30 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`rounded px-3 py-1 font-bold uppercase tracking-[0.1em] transition ${
                        !previewMode ? 'bg-ember-500 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`rounded px-3 py-1 font-bold uppercase tracking-[0.1em] transition ${
                        previewMode ? 'bg-ember-500 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Pregled
                    </button>
                  </div>
                </div>
                {previewMode ? (
                  <div
                    className="prose prose-invert min-h-[260px] max-w-none rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <textarea
                    required
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 font-mono text-sm text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                    placeholder="<h2>Naslov sekcije</h2><p>Paragraf teksta…</p>"
                  />
                )}
                <p className="mt-1 text-xs text-white/40">
                  Dozvoljeni HTML tagovi: h1–h4, p, strong, em, u, a, ul/ol/li, blockquote, code, img, hr. Sadržaj se automatski saniterizuje pri čuvanju.
                </p>
              </div>

              {/* Cover Image */}
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url || null })}
                slot="blog"
                label="Cover slika"
              />

              {/* Tags */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Tagovi</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="recept, ljuti sos, paprike (razdvojeno zarezom)"
                />
              </div>

              {/* Author */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Autor</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
                  placeholder="SmokHot"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={`relative h-7 w-12 rounded-full transition ${
                    formData.published ? 'bg-ember-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData.published ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-white">
                  {formData.published ? 'Objavljeno' : 'Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-ember-500 px-6 py-3 font-bold text-white transition hover:bg-ember-600 disabled:opacity-50"
                >
                  {saving ? 'Čuvanje...' : editingPost ? 'Sačuvaj izmene' : 'Kreiraj post'}
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
