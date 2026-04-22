/**
 * seed-snapshots.ts — generate bundled initial snapshots.
 *
 * Reads the current Prisma DB and writes JSON snapshots to public/snapshots/
 * so that a fresh deploy has a fallback even before the first live fetch has
 * populated /tmp.
 *
 * Run: npx tsx scripts/seed-snapshots.ts
 * CI hook: wire into "postbuild" or "predeploy" in package.json when the
 * production DB is reachable at build time.
 */
import { promises as fs } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const OUT_DIR = path.join(process.cwd(), 'public', 'snapshots')

function now() {
  return new Date().toISOString()
}

function transformProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    blurb: p.blurb,
    heatLevel: p.heatLevel,
    heatNumber: p.heatNumber,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    mainImage: p.mainImage,
    galleryImages: p.galleryImages ? JSON.parse(p.galleryImages) : [],
    thumbnail: p.thumbnail,
    ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
    volume: p.volume,
    scoville: p.scoville,
    pairings: p.pairings ? JSON.parse(p.pairings) : [],
    inStock: p.inStock,
    stockCount: p.stockCount,
    featured: p.featured,
    categories: p.categories ? JSON.parse(p.categories) : [],
    calories: p.calories,
    fat: p.fat,
    carbs: p.carbs,
    protein: p.protein,
    sodium: p.sodium,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

async function write(key: string, data: unknown) {
  const file = path.join(OUT_DIR, `${key}.json`)
  const payload = JSON.stringify({ data, savedAt: now() }, null, 2)
  await fs.writeFile(file, payload, 'utf8')
  console.log(`  ✅ ${key}.json (${Array.isArray(data) ? data.length + ' items' : 'object'})`)
}

async function main() {
  console.log('🌶️  Seeding bundled snapshots...')
  await fs.mkdir(OUT_DIR, { recursive: true })

  const products = await prisma.product.findMany({ orderBy: { heatNumber: 'asc' } })
  await write('products', products.map(transformProduct))

  const blog = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
  await write(
    'blog',
    blog.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      excerpt: b.excerpt,
      coverImage: b.coverImage,
      author: b.author,
      tags: b.tags ? JSON.parse(b.tags) : [],
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
  )

  const gallery = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  await write(
    'gallery',
    gallery.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      imageUrl: i.imageUrl,
      category: i.category,
      featured: i.featured,
      sortOrder: i.sortOrder,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
  )

  const turneja = await prisma.tourEvent.findMany({ orderBy: { date: 'desc' } })
  await write(
    'turneja',
    turneja.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      date: e.date.toISOString(),
      time: e.time,
      status: e.status,
      highlight: e.highlight,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  )

  const settings = await prisma.setting.findMany()
  const settingsMap: Record<string, string> = {}
  for (const s of settings) settingsMap[s.key] = s.value
  await write('settings', settingsMap)

  console.log('✅ Done. Snapshots live in public/snapshots/')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
