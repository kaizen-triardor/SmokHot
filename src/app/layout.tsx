import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import '@/styles/globals.css'

// Early DNS+TLS handshake to Supabase Storage host so the first product/blog
// image fetch doesn't pay connection setup cost. No-op when env is missing.
function SupabasePreconnect() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL
  if (!raw) return null
  try {
    const host = new URL(raw).origin
    return (
      <>
        <link rel="preconnect" href={host} crossOrigin="" />
        <link rel="dns-prefetch" href={host} />
      </>
    )
  } catch {
    return null
  }
}

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-bebas',
})

// Root metadata is locale-agnostic — per-locale metadata is set in
// src/app/[locale]/layout.tsx via generateMetadata.
export const metadata: Metadata = {
  metadataBase: new URL('https://smokhot.rs'),
  authors: [{ name: "Smokin' Hot" }],
  creator: 'Triardor Studio',
  publisher: "Smokin' Hot",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // `getLocale()` returns the resolved locale for the current request. On
  // locale-aware routes this is `en`/`ru`/etc.; on admin routes (not under
  // [locale]) it falls back to defaultLocale ('sr').
  const locale = await getLocale()
  return (
    <html lang={locale} className={`${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <SupabasePreconnect />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-primary-950 text-white selection:bg-fire-500/70`}>
        {children}
      </body>
    </html>
  )
}
