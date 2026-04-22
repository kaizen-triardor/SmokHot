import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'https://smokinhot.rs'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
