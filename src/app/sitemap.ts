import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSnapshot } from '@/lib/snapshot'

const siteUrl = process.env.NEXTAUTH_URL || 'https://smokinhot.rs'

export const revalidate = 3600 // rebuild sitemap at most hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/galerija`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/o-nama`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/kontakt`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/politika-privatnosti`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/uslovi-koriscenja`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Products — warm-serve aware: try DB, fall back to snapshot
  let products: Array<{ slug: string; updatedAt?: string | Date }> = []
  try {
    products = await prisma.product.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    })
  } catch {
    const snap = await getSnapshot<Array<{ slug: string; updatedAt?: string }>>('products')
    if (snap) products = snap
  }
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/shop/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Blog posts
  let posts: Array<{ slug: string; updatedAt?: string | Date }> = []
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
    })
  } catch {
    const snap = await getSnapshot<Array<{ slug: string; updatedAt?: string }>>('blog')
    if (snap) posts = snap
  }
  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
