/**
 * withTimeoutFallback — race a live query against a timeout.
 *
 * If the live query wins, return { data, source: 'live' } and optionally
 * let the caller refresh the snapshot. If the timeout wins, try the fallback
 * snapshot. If the snapshot is also missing, wait for the live query no
 * matter how long it takes (better slow than 500).
 */
export type FallbackSource = 'live' | 'fallback' | 'stale'

export interface FallbackResult<T> {
  data: T
  source: FallbackSource
  ms: number
}

export async function withTimeoutFallback<T>(
  live: () => Promise<T>,
  fallback: () => Promise<T | null>,
  timeoutMs = 3000,
): Promise<FallbackResult<T>> {
  const t0 = Date.now()

  // Kick off live query immediately — keep its handle so we can await later if needed.
  const liveP = live().catch((err) => {
    console.error('[withTimeoutFallback] live query rejected:', err)
    return null as T | null
  })

  // Race: live result vs. timeout sentinel
  const timeoutSentinel = Symbol('timeout')
  const timeoutP = new Promise<typeof timeoutSentinel>((resolve) =>
    setTimeout(() => resolve(timeoutSentinel), timeoutMs),
  )

  const winner = await Promise.race([liveP, timeoutP])

  if (winner !== timeoutSentinel && winner !== null) {
    return { data: winner as T, source: 'live', ms: Date.now() - t0 }
  }

  // Live either timed out or rejected — try snapshot.
  const snap = await fallback()
  if (snap !== null) {
    // Fire-and-forget: wait for the live query so next caller has fresh data.
    // (We don't await — this function returns now.)
    void liveP
    return { data: snap, source: 'fallback', ms: Date.now() - t0 }
  }

  // No snapshot either — wait for live no matter how long.
  const delayed = await liveP
  if (delayed !== null) {
    return { data: delayed as T, source: 'stale', ms: Date.now() - t0 }
  }
  // Genuinely nothing we can serve. Throw — API route will translate to 503.
  throw new Error('Both live query and fallback snapshot are unavailable')
}
