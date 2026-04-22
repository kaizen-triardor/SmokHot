import { withTimeoutFallback } from '../src/lib/with-timeout-fallback'
import { getSnapshot } from '../src/lib/snapshot'

async function main() {
  console.log('Test 1: live succeeds fast → source=live')
  let r = await withTimeoutFallback(async () => ({ a: 1 }), async () => null, 3000)
  console.log('  result:', r, '\n')

  console.log('Test 2: live takes 5s (> 1.5s timeout), fallback has data → source=fallback')
  r = await withTimeoutFallback(
    async () => { await new Promise(res => setTimeout(res, 5000)); return { from: 'live' } as any },
    async () => ({ from: 'snapshot' } as any),
    1500,
  )
  console.log('  result:', r, '\n')

  console.log('Test 3: live throws, fallback has data → source=fallback')
  r = await withTimeoutFallback(
    async () => { throw new Error('db down') },
    async () => ({ from: 'snapshot' } as any),
    3000,
  )
  console.log('  result:', r, '\n')

  console.log('Test 4: real snapshot read from public/snapshots/')
  const snap = await getSnapshot('products')
  console.log('  products.json loaded:', Array.isArray(snap) ? snap.length + ' items' : 'null')
  console.log('  first:', Array.isArray(snap) ? (snap as any)[0]?.name : 'n/a')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
