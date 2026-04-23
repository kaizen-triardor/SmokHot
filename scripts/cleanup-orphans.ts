/**
 * List (or delete) Supabase Storage objects that no DB row references.
 *
 * Admins replace images via the CMS. Each replacement leaves the old object
 * in the bucket. Over months of edits that storage bloat adds up and the
 * catalog drifts toward the Supabase Free 1 GB cap even though the *live*
 * image set stays tiny.
 *
 * Run:
 *   npx tsx scripts/cleanup-orphans.ts              # dry-run: list orphans
 *   npx tsx scripts/cleanup-orphans.ts --delete     # actually delete
 *   npx tsx scripts/cleanup-orphans.ts --json       # machine-readable report
 *
 * Requires the same env as the upload route:
 *   SUPABASE_PROJECT_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_STORAGE_BUCKET (default 'uploads')
 */
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const DELETE = process.argv.includes('--delete')
const AS_JSON = process.argv.includes('--json')

const PROJECT_URL = process.env.SUPABASE_PROJECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'

if (!PROJECT_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_PROJECT_URL / SUPABASE_SERVICE_ROLE_KEY env.')
  process.exit(2)
}

const supabase = createClient(PROJECT_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const prisma = new PrismaClient()

interface Obj {
  name: string // full path inside bucket, e.g. "products/abc123.webp"
  size: number
}

async function listAllObjects(prefix = ''): Promise<Obj[]> {
  const out: Obj[] = []
  let offset = 0
  const PAGE = 100
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw error
    if (!data || data.length === 0) break
    for (const item of data) {
      if (item.id === null) {
        // sub-folder — recurse
        const sub = await listAllObjects(prefix ? `${prefix}/${item.name}` : item.name)
        out.push(...sub)
      } else {
        const size = typeof item.metadata?.size === 'number' ? item.metadata.size : 0
        const fullName = prefix ? `${prefix}/${item.name}` : item.name
        out.push({ name: fullName, size })
      }
    }
    if (data.length < PAGE) break
    offset += PAGE
  }
  return out
}

async function collectReferencedPaths(): Promise<Set<string>> {
  const refs = new Set<string>()
  const tryCollect = async (fn: () => Promise<string[]>) => {
    try {
      const arr = await fn()
      for (const v of arr) if (v) refs.add(stripToStoragePath(v))
    } catch { /* table absent or other — ignore */ }
  }

  // Product main image
  await tryCollect(async () => {
    const rows = await prisma.product.findMany({ select: { mainImage: true } })
    return rows.map((r) => r.mainImage || '').filter(Boolean)
  })

  // Blog cover image
  await tryCollect(async () => {
    const rows = await (prisma as unknown as {
      blogPost: { findMany: (args: unknown) => Promise<Array<{ coverImage: string | null }>> }
    }).blogPost.findMany({ select: { coverImage: true } })
    return rows.map((r) => r.coverImage || '').filter(Boolean)
  })

  // Gallery image url
  await tryCollect(async () => {
    const rows = await (prisma as unknown as {
      galleryImage: { findMany: (args: unknown) => Promise<Array<{ imageUrl: string | null }>> }
    }).galleryImage.findMany({ select: { imageUrl: true } })
    return rows.map((r) => r.imageUrl || '').filter(Boolean)
  })

  // Turneja event image (best-effort)
  await tryCollect(async () => {
    const rows = await (prisma as unknown as {
      tourEvent: { findMany: (args: unknown) => Promise<Array<{ image: string | null }>> }
    }).tourEvent.findMany({ select: { image: true } })
    return rows.map((r) => r.image || '').filter(Boolean)
  })

  return refs
}

// Accepts either a full Supabase public URL, a signed URL, or a plain
// storage path. Returns the canonical `<slot>/<filename>` form.
function stripToStoragePath(value: string): string {
  // Match .../storage/v1/object/(public|sign)/<bucket>/<path>?...
  const m = value.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(\?|$)/)
  if (m && m[1] === BUCKET) return m[2]
  // Plain path already
  if (value.startsWith('/')) return value.replace(/^\//, '')
  return value
}

async function main() {
  const [objects, referenced] = await Promise.all([
    listAllObjects(),
    collectReferencedPaths(),
  ])

  const orphans = objects.filter((o) => !referenced.has(o.name))
  const totalOrphanBytes = orphans.reduce((n, o) => n + o.size, 0)

  if (AS_JSON) {
    console.log(JSON.stringify({
      bucket: BUCKET,
      totalObjects: objects.length,
      referencedCount: referenced.size,
      orphanCount: orphans.length,
      orphanBytes: totalOrphanBytes,
      orphans: orphans.map((o) => ({ path: o.name, size: o.size })),
    }, null, 2))
  } else {
    console.log(`bucket=${BUCKET} objects=${objects.length} referenced=${referenced.size} orphans=${orphans.length} reclaimable=${Math.round(totalOrphanBytes / 1024)} KB`)
    for (const o of orphans) {
      console.log(`  ${DELETE ? 'DELETE' : 'orphan'} ${o.name} (${o.size} B)`)
    }
  }

  if (DELETE && orphans.length > 0) {
    const paths = orphans.map((o) => o.name)
    // delete in chunks of 100 for safety
    for (let i = 0; i < paths.length; i += 100) {
      const slice = paths.slice(i, i + 100)
      const { error } = await supabase.storage.from(BUCKET).remove(slice)
      if (error) { console.error('remove batch failed:', error); break }
    }
    console.log(`deleted ${paths.length} orphan(s).`)
  } else if (!DELETE && orphans.length > 0) {
    console.log(`\n(dry-run) Rerun with --delete to reclaim.`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
