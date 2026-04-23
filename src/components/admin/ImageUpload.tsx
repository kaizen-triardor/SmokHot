'use client'

/**
 * ImageUpload — drag-to-drop + paste URL hybrid input.
 *
 * Handles both:
 *  1. Drag-drop / click-to-select file → POST to /api/admin/upload → writes to
 *     public/uploads/<slot>/<hash>.<ext>, returns the relative URL, calls
 *     onChange with the URL.
 *  2. Plain URL paste — still supported for admins bringing existing CDN links.
 *
 * Preview shown inline.
 */
import { useRef, useState } from 'react'
import { ArrowUpTrayIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  value: string | null | undefined
  onChange: (url: string) => void
  slot?: 'products' | 'blog' | 'gallery' | 'turneja' | 'misc'
  label?: string
  helperText?: string
}

export default function ImageUpload({
  value,
  onChange,
  slot = 'misc',
  label = 'Slika',
  helperText,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = () => localStorage.getItem('admin-token') || ''

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/upload?slot=${slot}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Greška pri otpremanju.')
        return
      }
      onChange(data.url)
    } catch (e) {
      setError('Mrežna greška pri otpremanju.')
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-bold text-white">{label}</label>
      )}

      {value ? (
        <div className="flex items-start gap-3">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async"
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-ember-500 focus:outline-none"
              placeholder="/uploads/… ili https://..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
              >
                <ArrowUpTrayIcon className="h-3 w-3" />
                {uploading ? 'Otpremanje…' : 'Zameni'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-red-400 transition hover:bg-red-500/20"
              >
                <XMarkIcon className="h-3 w-3" />
                Ukloni
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragActive
              ? 'border-ember-500 bg-ember-500/10'
              : 'border-white/15 bg-black/20 hover:border-white/30 hover:bg-black/40'
          }`}
        >
          <PhotoIcon className="h-10 w-10 text-white/40" />
          <div className="text-sm font-bold text-white">
            {uploading ? 'Otpremanje…' : 'Prevuci fajl ovde ili klikni da izabereš'}
          </div>
          <div className="text-xs text-white/40">
            JPG / PNG / WEBP / GIF · do 5 MB
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />

      {error && (
        <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
          {error}
        </div>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-white/45">{helperText}</p>
      )}
    </div>
  )
}
