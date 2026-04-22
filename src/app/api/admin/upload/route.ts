import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with a single 'file' field.
 * Stores the uploaded image under public/uploads/<slot>/<hash>.<ext>.
 *
 * Query params:
 *  - slot: 'products' | 'blog' | 'gallery' | 'turneja' (default 'misc')
 *
 * Returns { url: '/uploads/<slot>/<hash>.<ext>', size, width?, height?, mime }.
 *
 * On Vercel Hobby the /public filesystem is read-only at runtime; in prod
 * this endpoint should be swapped for Supabase Storage. For local dev it
 * writes directly to the public dir so you can see changes immediately.
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

    const dir = path.join(process.cwd(), 'public', 'uploads', slot)
    await fs.mkdir(dir, { recursive: true })
    const filePath = path.join(dir, filename)
    await fs.writeFile(filePath, buf)

    const url = `/uploads/${slot}/${filename}`
    return NextResponse.json(
      { url, size: file.size, mime: file.type, slot, filename },
      { status: 201 },
    )
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Greška pri otpremanju fajla.' }, { status: 500 })
  }
}
