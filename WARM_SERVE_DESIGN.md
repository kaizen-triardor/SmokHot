# Warm-Serve Architecture Design

**Problem:** Supabase Free tier pauses the DB after 7 days of no connections.
First visitor after a pause waits 15–30 seconds while the DB boots. They
see a blank loading spinner. They assume the site is broken. They leave.

**Goal:** Visitor never notices the DB is cold. Site feels instant at all times.

---

## 1. Current behaviour (the bug to solve)

```
Visitor → Vercel → Next.js 'use client' page → useEffect → fetch /api/products
                                                              │
                                                              v
                                                         Prisma → Supabase (cold)
                                                              │
                                                              v  (20 sec later)
                                                         Response
```

Every page in the current build is `'use client'` and fetches on mount. There is
**no layer** between the visitor and a possibly-cold DB. If the DB is sleeping,
every page just hangs on the skeleton.

---

## 2. Solution — layered defense

The cleanest answer is not one fix, it's four layers stacked. Each layer reduces
the probability of the visitor ever seeing a cold request. We pick how many
layers we ship in V1 based on time budget and real-world risk.

```
┌───────────────────────────────────────────────────────────────────┐
│ Visitor                                                           │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               v
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 1 — ISR static HTML cache (Vercel Edge)                     │
│ Pre-rendered pages with revalidate: 300 (5 min)                   │
│ Visitor sees cached HTML in <50ms, DB is never touched on hit.    │
│ Cache miss or revalidation → goes to Layer 2                       │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               v
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 2 — Snapshot fallback (Vercel KV or bundled JSON)           │
│ API route tries DB with 3-sec timeout.                            │
│ On timeout → returns last-known snapshot from cache.              │
│ Visitor sees data (possibly stale), DB wakes up in background.    │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               v
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 3 — Keep-alive cron                                         │
│ Vercel Cron pings /api/health every 6 days.                       │
│ SELECT 1 resets the 7-day inactivity timer.                       │
│ DB never actually pauses. Problem is eliminated at the source.    │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               v
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 4 — Friendly overlay (safety net)                           │
│ If an API call takes > 2 sec, show "Smokin' Hot zagreva peglu 🔥"  │
│ overlay with animated flame. Dismiss when data lands.             │
│ Visitor feels the site is alive even when wait is unavoidable.    │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               v
                          Supabase
```

### Cold-start flow with all layers on

1. Visitor hits `/shop`
2. Vercel Edge has cached HTML (Layer 1) → served in ~30 ms
3. Visitor clicks a product they've never visited → new request
4. Server component tries DB (3-sec timeout)
5. DB is waking up → timeout fires → Layer 2 serves snapshot
6. Visitor sees the product page with correct data (snapshot is max ~5 min old)
7. Admin-side writes during warmup still land on DB when it wakes (no data loss)
8. Subsequent requests hit warm DB — site feels instant forever after

---

## 3. Implementation scope options

Pick the tier that matches today's shipping budget. Each tier is cumulative.

### Tier 1 — "Good enough for launch" (90 min of work)

**Just Layer 3 (keep-alive cron).** This single layer eliminates 95% of the
problem by itself. If the DB never sleeps, nothing else matters.

**Deliverables:**
- `src/app/api/health/route.ts` — does `prisma.$queryRaw\`SELECT 1\`` and returns `{ ok: true }`
- `vercel.json` — `crons: [{ path: "/api/health", schedule: "0 0 */6 * *" }]` (every 6 days at midnight)
- Admin dashboard shows "Last ping: 2h ago ✅" widget for visibility

**Pros:** minimal code, no refactor, solves the problem.
**Cons:** on the 1% day Vercel Cron fails or Supabase changes their policy,
visitor hits a cold DB. No insurance.

### Tier 2 — "Belt + suspenders" (+ 3 hours)

**Add Layer 4 (friendly overlay) and Layer 2 (snapshot fallback).**

**Deliverables:**
- `src/components/ui/WarmupOverlay.tsx` — client component, observes `fetch`
  calls, shows branded overlay after 2 sec with animated flame + progress text
- `src/app/api/products-snapshot/route.ts` — reads `/tmp/products.json` or
  Vercel KV, returns cached data; bundled in the build as a fallback
- Wrap `/api/products`, `/api/products/[slug]`, `/api/blog`, `/api/gallery`,
  `/api/turneja`, `/api/settings` in a `withTimeoutFallback()` helper that
  races DB vs. 3-sec timeout, falls back to snapshot
- Cron job also refreshes the snapshot when it wakes the DB (bonus)

**Pros:** visitor never sees blank spinner; site works even if DB is fully down;
feels instant on every request.
**Cons:** snapshot can be up to a few minutes stale on catalog changes (fine
for a 7-product catalog that rarely changes).

### Tier 3 — "Architectural fix" (+ 8 hours)

**Add Layer 1 (ISR static HTML).** The QA audit already flagged that every
page being `'use client'` is an anti-pattern. Refactoring to server components
with ISR kills the cold-start risk AND fixes SEO at the same time.

**Deliverables:**
- Remove `'use client'` from `app/page.tsx`, `app/shop/page.tsx`,
  `app/shop/[slug]/page.tsx`, `app/blog/**`, `app/galerija/page.tsx`,
  `app/o-nama/page.tsx`, `app/kontakt/page.tsx`
- Keep `'use client'` only on interactive islands: `<AddToCartButton>`,
  `<ContactForm>`, `<CartSummary>`, `<HeatScale>` (if it animates)
- Convert data fetching to direct Prisma calls inside async server components
  OR `fetch` with `{ next: { revalidate: 300 } }`
- `generateStaticParams` for `/shop/[slug]` and `/blog/[slug]`
- `generateMetadata` per product/post (fixes the SEO P1 from the QA report too)
- Admin write handler calls `revalidatePath()` on the affected routes
- Legal pages already static — no change needed

**Pros:** fastest possible UX, best SEO, admin edits propagate in seconds,
Lighthouse scores go up significantly.
**Cons:** touches ~10 files, needs a full regression pass on cart/checkout
flow, not shippable today without a QA round.

---

## 4. My recommendation for V1 launch today

**Ship Tier 2 now. Plan Tier 3 for the next iteration.**

Tier 1 alone works but is fragile — one missed cron = one bad day. Tier 2 makes
the site genuinely bulletproof for ~4 hours of work. Tier 3 is the architectural
rewrite that deserves its own dedicated session with proper testing, and the
site will work fine without it.

### Tier 2 implementation steps (in order)

1. **Health endpoint + cron (20 min)**
   ```ts
   // src/app/api/health/route.ts
   export async function GET() {
     const t = Date.now()
     await prisma.$queryRaw`SELECT 1`
     return Response.json({ ok: true, ms: Date.now() - t })
   }
   ```
   ```json
   // vercel.json
   { "crons": [{ "path": "/api/health", "schedule": "0 0 */6 * *" }] }
   ```

2. **Snapshot infrastructure (60 min)**
   ```ts
   // src/lib/snapshot.ts
   // Read/write a JSON snapshot. Uses /tmp on Vercel (writable) OR Vercel KV
   // when available. Falls back to bundled /public/snapshots/*.json for cold
   // boots on fresh deploys.
   export async function getSnapshot(key: 'products' | 'blog' | 'gallery' | 'settings')
   export async function saveSnapshot(key, data)
   ```

3. **Timeout-race helper (20 min)**
   ```ts
   // src/lib/with-timeout-fallback.ts
   export async function withTimeoutFallback<T>(
     live: () => Promise<T>,
     fallback: () => Promise<T>,
     timeoutMs = 3000,
   ): Promise<{ data: T; source: 'live' | 'fallback' }>
   ```

4. **Patch 6 public API routes (45 min)**
   ```ts
   // src/app/api/products/route.ts (example)
   export async function GET() {
     const { data, source } = await withTimeoutFallback(
       () => prisma.product.findMany(...).then(transform),
       () => getSnapshot('products'),
     )
     // on successful live fetch, update the snapshot async (fire-and-forget)
     if (source === 'live') saveSnapshot('products', data).catch(() => {})
     return Response.json(data, { headers: { 'X-Source': source } })
   }
   ```

5. **Warmup overlay component (60 min)**
   ```tsx
   // src/components/ui/WarmupOverlay.tsx — client component
   // Wraps <body>, monitors window.fetch, sets a timer on start,
   // fires an overlay after 2s delay. Hides when all in-flight
   // requests resolve. Brand-themed: dark backdrop, animated flame SVG,
   // "Smokin' Hot zagreva peglu..." copy.
   ```

6. **Admin widget + smoke test (30 min)**
   - Admin dashboard shows last cron ping timestamp and current snapshot age
   - Manually test: stop dev server → load page (cached HTML still works) → confirm fallback triggers on deliberate 5-sec DB sleep

### Tier 2 estimated total: **3–4 hours focused work**

---

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Snapshot grows stale on admin writes | Admin write handler calls `saveSnapshot()` immediately on POST/PUT |
| `/tmp` on Vercel is ephemeral per invocation | Use Vercel KV (free 256 MB) for durable snapshots, or bundle `public/snapshots/*.json` as fallback-of-fallback |
| Cron fails silently | Log cron result to a `CronLog` table in DB; admin dashboard shows "No ping in last 7 days → warning" |
| Customer places order during DB cold start | Order submission path should write directly (no fallback); cart POST has its own 10-sec timeout; if it fails, retry from localStorage in background + show friendly "Obrada u toku..." message instead of error |
| Snapshot endpoint is hit before any live fetch ever succeeded | Bundle a one-time seed snapshot in `public/snapshots/products.initial.json` generated at build time via `prisma generate` step |
| Free tier DB pause policy changes | Cron + overlay + snapshot are independent — any 2 of 3 still keep the site working |

---

## 6. What we don't do (and why)

- **Service Worker / offline mode** — Too much complexity. Doesn't help first
  visit (the only case that matters). Cache staleness bugs hurt e-commerce
  trust. Revisit if the site becomes a PWA later.
- **Full CDN static export** — We have an admin CMS that writes to DB; a pure
  static export requires rebuilding the site on every admin edit, which takes
  60+ seconds on Vercel's free tier. ISR is the right choice.
- **Paid Supabase upgrade** — $25/mo Pro tier removes the pause entirely but
  costs money. Client chose free tier, so we engineer around it.
- **Edge Config for product data** — Vercel Edge Config is 512 KB max. Fine for
  settings but breaks at ~500 products. Not future-proof.

---

## 7. Future enhancements (post-launch, once traffic exists)

- **Vercel Analytics** integration to measure real cold-start frequency
- **Migrate to Tier 3 ISR** for proper architectural cleanup
- **Webhook-driven revalidation** — Supabase DB trigger → Vercel webhook →
  `revalidatePath()`, so admin edits go live in ~1 sec instead of after ISR
  window expires
- **Image CDN** — products served from Cloudflare R2 or Vercel Image Optimization
  to reduce bandwidth on free tier
- **Error budget monitoring** — Sentry or Highlight.io tracks if cold starts
  ever slip through the layers

---

## Appendix A — File touch list for Tier 2

**New files:**
- `src/app/api/health/route.ts`
- `src/lib/snapshot.ts`
- `src/lib/with-timeout-fallback.ts`
- `src/components/ui/WarmupOverlay.tsx`
- `vercel.json`
- `scripts/seed-initial-snapshots.ts` (build-time)
- `public/snapshots/products.initial.json` (generated at build)

**Modified files:**
- `src/app/api/products/route.ts`
- `src/app/api/products/[slug]/route.ts`
- `src/app/api/blog/route.ts`
- `src/app/api/blog/[slug]/route.ts`
- `src/app/api/gallery/route.ts`
- `src/app/api/turneja/route.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/admin/products/route.ts` (call `saveSnapshot()` on write)
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/blog/[id]/route.ts` (same)
- `src/app/api/admin/gallery/[id]/route.ts` (same)
- `src/app/api/admin/turneja/[id]/route.ts` (same)
- `src/app/api/admin/settings/route.ts` (same)
- `src/app/layout.tsx` (mount `<WarmupOverlay />`)
- `src/app/admin/dashboard/page.tsx` (show cron + snapshot status)
- `package.json` (add `scripts.predeploy` or `postbuild` for snapshot seeding)

**Total: 7 new + 14 modified = 21 touched files**

---

## Appendix B — Example code sketch

```ts
// src/lib/with-timeout-fallback.ts
export async function withTimeoutFallback<T>(
  live: () => Promise<T>,
  fallback: () => Promise<T | null>,
  timeoutMs = 3000,
): Promise<{ data: T; source: 'live' | 'fallback' | 'stale' }> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
  const liveP = live().catch(() => null)
  const winner = await Promise.race([liveP, timeout])
  if (winner !== null) return { data: winner, source: 'live' }
  const snapshot = await fallback()
  if (snapshot !== null) return { data: snapshot, source: 'fallback' }
  // last resort — wait full live result even though slow
  const delayed = await live()
  return { data: delayed, source: 'stale' }
}
```

```tsx
// src/components/ui/WarmupOverlay.tsx (sketch)
'use client'
import { useEffect, useState } from 'react'

export default function WarmupOverlay() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const inflight = new Set<Promise<any>>()
    let showTimer: NodeJS.Timeout | null = null

    const origFetch = window.fetch
    window.fetch = (...args) => {
      const p = origFetch(...args)
      inflight.add(p)
      if (!showTimer && inflight.size > 0) {
        showTimer = setTimeout(() => setShow(true), 2000)
      }
      p.finally(() => {
        inflight.delete(p)
        if (inflight.size === 0) {
          clearTimeout(showTimer!); showTimer = null
          setShow(false)
        }
      })
      return p
    }
    return () => { window.fetch = origFetch }
  }, [])

  if (!show) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center">
        <div className="text-6xl animate-pulse">🔥</div>
        <p className="mt-4 font-black uppercase tracking-[0.18em] text-fire-500">
          Smokin&apos; Hot zagreva peglu…
        </p>
        <p className="mt-2 text-sm text-white/60">Trenutak, sos uskoro stiže.</p>
      </div>
    </div>
  )
}
```
