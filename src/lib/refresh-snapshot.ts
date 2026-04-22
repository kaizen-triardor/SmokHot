/**
 * refreshSnapshot — rebuild a named snapshot from live DB.
 *
 * Called by admin write handlers after POST/PUT/DELETE so visitors see
 * fresh data even when the DB goes cold between edits. Best-effort: any
 * failure is logged but never blocks the admin response.
 */
import { prisma } from '@/lib/prisma'
import { saveSnapshot, type SnapshotKey } from '@/lib/snapshot'

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
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  }
}

function transformBlog(b: any) {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    content: b.content,
    excerpt: b.excerpt,
    coverImage: b.coverImage,
    author: b.author,
    tags: b.tags ? JSON.parse(b.tags) : [],
    createdAt: b.createdAt?.toISOString?.() ?? b.createdAt,
    updatedAt: b.updatedAt?.toISOString?.() ?? b.updatedAt,
  }
}

function transformGallery(i: any) {
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    imageUrl: i.imageUrl,
    category: i.category,
    featured: i.featured,
    sortOrder: i.sortOrder,
    createdAt: i.createdAt?.toISOString?.() ?? i.createdAt,
    updatedAt: i.updatedAt?.toISOString?.() ?? i.updatedAt,
  }
}

function transformTurneja(e: any) {
  return {
    id: e.id,
    title: e.title,
    location: e.location,
    date: e.date?.toISOString?.() ?? e.date,
    time: e.time,
    status: e.status,
    highlight: e.highlight,
    description: e.description,
    createdAt: e.createdAt?.toISOString?.() ?? e.createdAt,
    updatedAt: e.updatedAt?.toISOString?.() ?? e.updatedAt,
  }
}

export async function refreshSnapshot(key: SnapshotKey): Promise<void> {
  try {
    switch (key) {
      case 'products': {
        const rows = await prisma.product.findMany({ orderBy: { heatNumber: 'asc' } })
        await saveSnapshot('products', rows.map(transformProduct))
        break
      }
      case 'blog': {
        const rows = await prisma.blogPost.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
        })
        await saveSnapshot('blog', rows.map(transformBlog))
        break
      }
      case 'gallery': {
        const rows = await prisma.galleryImage.findMany({
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        })
        await saveSnapshot('gallery', rows.map(transformGallery))
        break
      }
      case 'turneja': {
        const rows = await prisma.tourEvent.findMany({ orderBy: { date: 'desc' } })
        await saveSnapshot('turneja', rows.map(transformTurneja))
        break
      }
      case 'settings': {
        const rows = await prisma.setting.findMany()
        const map: Record<string, string> = {}
        for (const r of rows) map[r.key] = r.value
        await saveSnapshot('settings', map)
        break
      }
    }
  } catch (err) {
    console.error(`[refreshSnapshot] ${key} failed:`, err)
  }
}

/** Call after successful write; fire-and-forget. */
export function refreshSnapshotAsync(key: SnapshotKey): void {
  void refreshSnapshot(key)
}
