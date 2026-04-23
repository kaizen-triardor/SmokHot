import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WarmupOverlay from '@/components/ui/WarmupOverlay'

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Meta.Root' })
  const base = 'https://smokhot.rs'

  return {
    title: {
      default: t('titleDefault'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t('keywords').split(',').map((k) => k.trim()).filter(Boolean),
    alternates: {
      canonical: locale === routing.defaultLocale ? base : `${base}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l === 'sr' ? 'sr-RS' : l,
          l === routing.defaultLocale ? base : `${base}/${l}`,
        ]),
      ),
    },
    openGraph: {
      type: 'website',
      locale: locale === 'sr' ? 'sr_RS' : locale,
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => (l === 'sr' ? 'sr_RS' : l)),
      url: locale === routing.defaultLocale ? base : `${base}/${locale}`,
      siteName: "Smokin' Hot",
      title: t('titleDefault'),
      description: t('description'),
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: t('ogAlt') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('titleDefault'),
      description: t('description'),
      images: ['/og-image.jpg'],
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
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering for this segment.
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <WarmupOverlay />
      <Header />
      {children}
      <Footer />
    </NextIntlClientProvider>
  )
}
