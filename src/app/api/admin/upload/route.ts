import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/admin-auth'
import {
  isStorageAvailable,
  uploadToSupabaseStorage,
} from '@/lib/supabase-storage'
import { logAudit } from '@/lib/audit-log'

/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with a single 'file' field. All non-GIF uploads
 * are resized (max 1600px longest edge) and re-encoded to WebP q80 before
 * storage. Typical 1.5 MB JPG becomes ~200 KB WebP — the single biggest lever
 * for staying inside free-tier Supabase egress as the catalog grows. GIFs are
 * left untouched to preserve animation.
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

// Size applies to the *input* file; sharp may produce a much smaller output.
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB input cap — sharp will shrink it
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_SLOTS = new Set(['products', 'blog', 'gallery', 'turneja', 'misc'])

const TARGET_MAX_EDGE = 1600
const WEBP_QUALITY = 80

interface Optimized {
  buffer: Buffer
  mime: string
  ext: string
}

async function optimizeImage(input: Buffer, sourceMime: string): Promise<Optimized> {
  // GIFs are (usually) animated; sharp's webp can preserve animation but
  // bumps size and CPU. Easier and safer: pass GIFs through as-is.
  if (sourceMime === 'image/gif') {
    return { buffer: input, mime: 'image/gif', ext: 'gif' }
  }

  const buffer = await sharp(input, { failOn: 'truncated' })
    .rotate() // respect EXIF orientation before discarding metadata
    .resize({
      width: TARGET_MAX_EDGE,
      height: TARGET_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer()

  return { buffer, mime: 'image/webp', ext: 'webp' }
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

    const inputBuf = Buffer.from(await file.arrayBuffer())

    let optimized: Optimized
    try {
      optimized = await optimizeImage(inputBuf, file.type)
    } catch (optErr) {
      console.error('[upload] sharp optimization failed:', optErr)
      return NextResponse.json(
        { error: 'Slika nije mogla biti obrađena. Proverite da fajl nije oštećen.' },
        { status: 422 },
      )
    }

    const hash = crypto.createHash('sha256').update(optimized.buffer).digest('hex').slice(0, 16)
    const filename = `${hash}.${optimized.ext}`
    const storagePath = `${slot}/${filename}`
    const savedPct = optimized.buffer.byteLength < inputBuf.byteLength
      ? Math.round((1 - optimized.buffer.byteLength / inputBuf.byteLength) * 100)
      : 0

    // Primary: Supabase Storage
    if (isStorageAvailable()) {
      try {
        const result = await uploadToSupabaseStorage(storagePath, optimized.buffer, optimized.mime)
        await logAudit(request, adminOrResp, {
          action: 'CREATE',
          resource: 'upload',
          resourceId: result.path,
          summary: `Otpremljeno (Supabase): ${result.path} — uštedelo ${savedPct}%`,
          metadata: {
            bytesIn: inputBuf.byteLength,
            bytesOut: result.size,
            mimeIn: file.type,
            mimeOut: result.mime,
            savedPct,
          },
        })
        return NextResponse.json(
          { ...result, slot, storage: 'supabase', originalBytes: inputBuf.byteLength, savedPct },
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
      await fs.writeFile(filePath, optimized.buffer)
      const url = `/uploads/${slot}/${filename}`
      await logAudit(request, adminOrResp, {
        action: 'CREATE',
        resource: 'upload',
        resourceId: url,
        summary: `Otpremljeno (local): ${url} — uštedelo ${savedPct}%`,
        metadata: {
          bytesIn: inputBuf.byteLength,
          bytesOut: optimized.buffer.byteLength,
          mimeIn: file.type,
          mimeOut: optimized.mime,
          savedPct,
        },
      })
      return NextResponse.json(
        {
          url,
          size: optimized.buffer.byteLength,
          mime: optimized.mime,
          slot,
          storage: 'local',
          filename,
          originalBytes: inputBuf.byteLength,
          savedPct,
        },
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
