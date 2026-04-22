import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import {
  isStorageAvailable,
  uploadToSupabaseStorage,
} from '@/lib/supabase-storage'
import { logAudit } from '@/lib/audit-log'

/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with a single 'file' field.
 *
 * Storage strategy (fastest-first):
 *  1. Supabase Storage (production) — durable across deploys, CDN-backed
 *  2. Local filesystem fallback (dev only) — /public/uploads/<slot>/<hash>.<ext>
 *
 * Query params:
 *  - slot: 'products' | 'blog' | 'gallery' | 'turneja' (default 'misc')
 *
 * Returns { url, size, mime, slot, storage: 'supabase'|'local' }.
 */

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_SLOTS = new Set(['products', 'blog', 'gallery', 'turneja', 'misc'])

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return 'jpg'
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    default: return 'bin'
  }
}

export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  const { searchParams } = new URL(request.url)
  const slotParam = (searchParams.get('slot') || 'misc').toLowerCase()
  const slot = ALLOWED_SLOTS.has(slotParam) ? slotParam : 'misc'

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fajl nije priložen.' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Fajl je prazan.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Maksimalna veličina fajla je ${Math.round(MAX_BYTES / 1024 / 1024)} MB.` },
        { status: 413 },
      )
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: 'Dozvoljeni formati: JPG, PNG, WEBP, GIF.' },
        { status: 415 },
      )
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)
    const ext = extFromMime(file.type)
    const filename = `${hash}.${ext}`
    const storagePath = `${slot}/${filename}`

    // Primary: Supabase Storage
    if (isStorageAvailable()) {
      try {
        const result = await uploadToSupabaseStorage(storagePath, buf, file.type)
        await logAudit(request, adminOrResp, {
          action: 'CREATE',
          resource: 'upload',
          resourceId: result.path,
          summary: `Otpremljeno (Supabase): ${result.path}`,
          metadata: { bytes: result.size, mime: result.mime },
        })
        return NextResponse.json(
          { ...result, slot, storage: 'supabase' },
          { status: 201 },
        )
      } catch (err) {
        console.error('[upload] Supabase upload failed, falling back to local:', err)
        // Fall through to local
      }
    }

    // Fallback: local filesystem (dev only, ephemeral on Vercel)
    const dir = path.join(process.cwd(), 'public', 'uploads', slot)
    try {
      await fs.mkdir(dir, { recursive: true })
      const filePath = path.join(dir, filename)
      await fs.writeFile(filePath, buf)
      const url = `/uploads/${slot}/${filename}`
      await logAudit(request, adminOrResp, {
        action: 'CREATE',
        resource: 'upload',
        resourceId: url,
        summary: `Otpremljeno (local): ${url}`,
        metadata: { bytes: buf.byteLength, mime: file.type },
      })
      return NextResponse.json(
        { url, size: file.size, mime: file.type, slot, storage: 'local', filename },
        { status: 201 },
      )
    } catch (fsErr) {
      console.error('[upload] local fs write failed:', fsErr)
      return NextResponse.json(
        {
          error:
            'Otpremanje nije uspelo. Supabase Storage nije konfigurisano, a lokalni FS je read-only (verovatno produkcija). Dodajte SUPABASE_SERVICE_ROLE_KEY u env vars.',
        },
        { status: 503 },
      )
    }
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Greška pri otpremanju fajla.' }, { status: 500 })
  }
}
