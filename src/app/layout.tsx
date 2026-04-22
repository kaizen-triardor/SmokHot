import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '@/styles/globals.css'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter'
})

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-bebas'
})

export const metadata: Metadata = {
  title: {
    default: 'Smokin\' Hot | Ljuti sosovi iz Srbije',
    template: '%s | Smokin\' Hot'
  },
  description: 'Premium srpski ljuti sosovi - od blagih dimljenih ukusa do brutalnih udara. Domaća proizvodnja, pouzeće širom Srbije. Rock \'n\' roll susreće craft kvalitet.',
  keywords: [
    'ljuti sosovi',
    'hot sauce srbija',
    'srpski ljuti sos',
    'chili sauce',
    'dimljeni sosovi',
    'pouzeće srbija',
    'domaći ljuti sos',
    'craft hot sauce',
    'smokin hot'
  ],
  authors: [{ name: 'Smokin\' Hot' }],
  creator: 'Triardor Studio',
  publisher: 'Smokin\' Hot',
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://smokhot.rs',
    siteName: 'Smokin\' Hot',
    title: 'Smokin\' Hot - Ljuti sosovi iz Srbije',
    description: 'Premium srpski ljuti sosovi - od blagih dimljenih ukusa do brutalnih udara. Domaća proizvodnja, pouzeće širom Srbije.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Smokin\' Hot - Ljuti sosovi iz Srbije'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smokin\' Hot - Ljuti sosovi iz Srbije',
    description: 'Premium srpski ljuti sosovi - od blagih dimljenih ukusa do brutalnih udara.',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr" className={`${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-primary-950 text-white selection:bg-fire-500/70`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}