const createNextIntlPlugin = require('next-intl/plugin')

// Scope Supabase Storage host to the configured project when available;
// fall back to the public Supabase domain otherwise. Uses `remotePatterns`
// (non-legacy) with a path filter so only public-bucket objects pass.
const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL
  if (!raw) return '*.supabase.co'
  try { return new URL(raw).host } catch { return '*.supabase.co' }
})()

// next-intl plugin reads request config from src/i18n/request.ts at build time.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'smokhot.rs' },
      { protocol: 'https', hostname: 'instagram.com' },
    ],
    // WebP only: AVIF doubles transformation count for negligible gain on a 7-SKU catalog.
    formats: ['image/webp'],
    // 5 widths cover phone→desktop; dropped 750/2048/3840 to cut variant fanout.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256],
    // 31 days — product/hero/blog images rarely change; prevents STALE churn.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
