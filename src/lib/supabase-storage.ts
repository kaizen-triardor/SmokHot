/**
 * Supabase Storage helper for admin uploads.
 *
 * In production (Vercel) `/public` is read-only at runtime, so `/api/admin/upload`
 * cannot write to the local filesystem. This module wraps the Supabase
 * Storage JS client and returns public URLs.
 *
 * Required env:
 *  - SUPABASE_PROJECT_URL or NEXT_PUBLIC_SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY (server-only; bypasses RLS for admin uploads)
 *  - SUPABASE_STORAGE_BUCKET (default: 'uploads')
 *
 * When any of the above is missing, `isStorageAvailable()` returns false and
 * `/api/admin/upload` falls back to the local filesystem (dev only).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const PROJECT_URL = process.env.SUPABASE_PROJECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!PROJECT_URL || !SERVICE_KEY) return null
  if (cached) return cached
  cached = createClient(PROJECT_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}

export function isStorageAvailable(): boolean {
  return Boolean(PROJECT_URL && SERVICE_KEY)
}

export interface UploadResult {
  url: string
  path: string
  size: number
  mime: string
}

/**
 * Upload a buffer to Supabase Storage. Returns the public URL (bucket must be
 * public) or a signed URL (for private buckets — 10 year expiry).
 */
export async function uploadToSupabaseStorage(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase Storage not configured')

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType,
    // Content-addressed filenames (SHA256 hash) never change per byte-sequence,
    // so `immutable` is safe: browsers/CDN never revalidate. 1 year TTL.
    cacheControl: '31536000, immutable',
    upsert: true,
  })
  if (error) throw error

  // Try public URL first (works if the bucket is configured as public).
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  if (pub?.publicUrl) {
    return { url: pub.publicUrl, path, size: buffer.byteLength, mime: contentType }
  }

  // Fallback: 10-year signed URL for private buckets
  const { data: signed, error: signErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 315_576_000)
  if (signErr || !signed?.signedUrl) {
    throw signErr || new Error('Failed to generate signed URL')
  }
  return { url: signed.signedUrl, path, size: buffer.byteLength, mime: contentType }
}
