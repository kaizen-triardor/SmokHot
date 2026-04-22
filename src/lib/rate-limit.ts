/**
 * Simple in-memory token bucket for per-IP rate limiting.
 *
 * Single-instance (not distributed); fine for a small Vercel deployment
 * because rate-limit state is per-lambda-instance and cold instances
 * start with a fresh bucket. Defense-in-depth rather than a hard gate.
 *
 * For production-grade protection we'd swap in Upstash Rate Limit or a
 * Redis-backed bucket.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitOptions {
  max: number // max events per window
  windowMs: number // window length in ms
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { allowed: true, remaining: opts.max - 1, retryAfterSec: 0 }
  }

  if (existing.count >= opts.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: opts.max - existing.count,
    retryAfterSec: 0,
  }
}

/** Sweep expired buckets periodically. Safe to no-op on cold starts. */
export function sweepRateLimits(): number {
  const now = Date.now()
  let removed = 0
  for (const [k, b] of buckets.entries()) {
    if (b.resetAt <= now) {
      buckets.delete(k)
      removed++
    }
  }
  return removed
}
