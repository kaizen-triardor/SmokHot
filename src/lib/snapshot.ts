/**
 * Snapshot cache for warm-serve architecture.
 *
 * Storage strategy (fastest-first):
 *   1. /tmp/snapshots/*.json       — per-lambda cache, hot in memory-mapped FS
 *   2. public/snapshots/*.json     — bundled at build, always present
 *
 * On Vercel, /tmp is writable but ephemeral per lambda instance. That's fine:
 * every instance will populate /tmp on its first successful live fetch, and
 * public/snapshots serves as a permanent floor. A stale-by-minutes snapshot is
 * infinitely better than a 30-second cold-start spinner.
 */
import { promises as fs } from 'fs'
import path from 'path'

export type SnapshotKey =
  | 'products'
  | 'blog'
  | 'gallery'
  | 'turneja'
  | 'settings'

const TMP_DIR = process.env.NODE_ENV === 'production' ? '/tmp/snapshots' : path.join(process.cwd(), '.snapshots')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'snapshots')

function tmpPath(key: SnapshotKey) {
  return path.join(TMP_DIR, `${key}.json`)
}

function bundledPath(key: SnapshotKey) {
  return path.join(PUBLIC_DIR, `${key}.json`)
}

/**
 * Read the most-recent cached snapshot for `key`, or null if nothing exists.
 * Tries /tmp first (most recent), falls back to bundled floor.
 */
export async function getSnapshot<T = unknown>(key: SnapshotKey): Promise<T | null> {
  // 1. Hot cache
  try {
    const raw = await fs.readFile(tmpPath(key), 'utf8')
    const parsed = JSON.parse(raw)
    return parsed.data as T
  } catch {
    /* fall through */
  }
  // 2. Bundled floor
  try {
    const raw = await fs.readFile(bundledPath(key), 'utf8')
    const parsed = JSON.parse(raw)
    return parsed.data as T
  } catch {
    return null
  }
}

/**
 * Persist a fresh snapshot to /tmp. Non-blocking: any errors are logged,
 * never thrown — a failed snapshot write must not break the live response.
 */
export async function saveSnapshot<T = unknown>(key: SnapshotKey, data: T): Promise<void> {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true })
    const payload = JSON.stringify({ data, savedAt: new Date().toISOString() })
    await fs.writeFile(tmpPath(key), payload, 'utf8')
  } catch (err) {
    // Snapshot write is best-effort. Don't let it crash the request.
    console.error(`[snapshot] saveSnapshot(${key}) failed:`, err)
  }
}

/**
 * Return metadata about a snapshot (when it was last updated, which layer served it).
 * Used by admin dashboard to show health.
 */
export async function getSnapshotMeta(key: SnapshotKey): Promise<{
  source: 'hot' | 'bundled' | 'missing'
  savedAt: string | null
}> {
  try {
    const raw = await fs.readFile(tmpPath(key), 'utf8')
    const parsed = JSON.parse(raw)
    return { source: 'hot', savedAt: parsed.savedAt ?? null }
  } catch {
    try {
      const raw = await fs.readFile(bundledPath(key), 'utf8')
      const parsed = JSON.parse(raw)
      return { source: 'bundled', savedAt: parsed.savedAt ?? null }
    } catch {
      return { source: 'missing', savedAt: null }
    }
  }
}
