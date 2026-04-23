/**
 * Batch-optimize all raster images under public/uploads/<slot>/.
 *
 * For each .jpg/.jpeg/.png/.gif:
 *  - Skip GIFs (preserve animation)
 *  - Resize longest edge to 1600 px (no upscale)
 *  - Re-encode to WebP q80
 *  - Write <basename>.webp next to the original, keep original
 *  - Update any DB row referencing the old path → new .webp path
 *  - Also rewrite the hardcoded seed file (prisma/seed.ts) so future reseeds
 *    pick up the optimized path
 *
 * Run:
 *   npx tsx scripts/optimize-uploads.ts        # dry run
 *   npx tsx scripts/optimize-uploads.ts --write # perform changes
 *
 * Idempotent: skips files whose .webp sibling already exists and whose DB
 * reference already points at the .webp.
 */
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { PrismaClient } from '@prisma/client'

const WRITE = process.argv.includes('--write')
const ROOT = path.join(process.cwd(), 'public', 'uploads')
const MAX_EDGE = 1600
const QUALITY = 80

interface ConvertedFile {
  oldRel: string
  newRel: string
  oldBytes: number
  newBytes: number
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(full)))
    else if (e.isFile() && /\.(jpe?g|png)$/i.test(e.name)) out.push(full)
  }
  return out
}

async function convertOne(absPath: string): Promise<ConvertedFile | null> {
  const rel = '/' + path.relative(path.join(process.cwd(), 'public'), absPath).split('\\').join('/')
  const newAbs = absPath.replace(/\.(jpe?g|png)$/i, '.webp')
  const newRel = '/' + path.relative(path.join(process.cwd(), 'public'), newAbs).split('\\').join('/')

  const inputStat = await fs.stat(absPath)
  try {
    const existing = await fs.stat(newAbs)
    if (existing.isFile()) {
      console.log(`  skip (exists): ${rel} -> ${newRel}`)
      return { oldRel: rel, newRel, oldBytes: inputStat.size, newBytes: existing.size }
    }
  } catch { /* does not exist — convert */ }

  const input = await fs.readFile(absPath)
  const output = await sharp(input, { failOn: 'truncated' })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer()

  const savedPct = Math.round((1 - output.length / input.length) * 100)
  console.log(`  ${WRITE ? 'WRITE' : 'DRY '} ${rel} -> ${newRel}: ${input.length}B -> ${output.length}B (-${savedPct}%)`)

  if (WRITE) await fs.writeFile(newAbs, output)
  return { oldRel: rel, newRel, oldBytes: input.length, newBytes: output.length }
}

async function updateSeedFile(mappings: Map<string, string>) {
  const seedPath = path.join(process.cwd(), 'prisma', 'seed.ts')
  let src: string
  try { src = await fs.readFile(seedPath, 'utf8') } catch { return }
  let changed = 0
  mappings.forEach((newRel, oldRel) => {
    if (src.includes(oldRel)) {
      src = src.split(oldRel).join(newRel)
      changed++
    }
  })
  if (changed > 0) {
    console.log(`\nseed.ts: rewriting ${changed} reference(s)`)
    if (WRITE) await fs.writeFile(seedPath, src)
  }
}

async function updateDatabase(mappings: Map<string, string>) {
  let prisma: PrismaClient
  try {
    prisma = new PrismaClient()
  } catch (err) {
    console.log(`\nDB update skipped — Prisma init failed: ${(err as Error).message.split('\n')[0]}`)
    return
  }

  const entries: Array<[string, string]> = []
  mappings.forEach((newRel, oldRel) => entries.push([oldRel, newRel]))

  try {
    for (const entry of entries) {
      const oldRel = entry[0]
      const newRel = entry[1]
      try {
        const prodRes = await prisma.product.updateMany({
          where: { mainImage: oldRel },
          data: WRITE ? { mainImage: newRel } : {},
        })
        if (prodRes.count > 0) console.log(`  products: ${prodRes.count} x ${oldRel} -> ${newRel}`)
      } catch (err) {
        console.log(`\nDB update skipped — DB unreachable (${(err as Error).message.split('\n')[0]}).`)
        console.log('seed.ts rewrite will take effect on next re-seed.')
        return
      }

      try {
        const blogRes = await (prisma as unknown as {
          blogPost: { updateMany: (args: unknown) => Promise<{ count: number }> }
        }).blogPost.updateMany({
          where: { coverImage: oldRel },
          data: WRITE ? { coverImage: newRel } : {},
        })
        if (blogRes.count > 0) console.log(`  blogPost: ${blogRes.count} x ${oldRel} -> ${newRel}`)
      } catch { /* model absent / other — ignore */ }

      try {
        const galRes = await (prisma as unknown as {
          galleryImage: { updateMany: (args: unknown) => Promise<{ count: number }> }
        }).galleryImage.updateMany({
          where: { imageUrl: oldRel },
          data: WRITE ? { imageUrl: newRel } : {},
        })
        if (galRes.count > 0) console.log(`  galleryImage: ${galRes.count} x ${oldRel} -> ${newRel}`)
      } catch { /* model absent — ignore */ }
    }
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

async function main() {
  console.log(`optimize-uploads: mode=${WRITE ? 'WRITE' : 'DRY'} root=${ROOT}\n`)
  const files = await walk(ROOT)
  if (files.length === 0) {
    console.log('no raster images found under /public/uploads')
    return
  }

  const mappings = new Map<string, string>()
  let totalIn = 0
  let totalOut = 0
  for (const f of files) {
    const r = await convertOne(f)
    if (r) {
      mappings.set(r.oldRel, r.newRel)
      totalIn += r.oldBytes
      totalOut += r.newBytes
    }
  }

  console.log(`\n${files.length} file(s): ${totalIn} B -> ${totalOut} B (-${Math.round((1 - totalOut / totalIn) * 100)}%)`)

  await updateSeedFile(mappings)
  await updateDatabase(mappings)

  if (!WRITE) console.log('\nRerun with --write to apply.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
