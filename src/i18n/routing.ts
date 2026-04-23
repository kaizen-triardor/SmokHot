import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['sr', 'en', 'ru', 'ro', 'hu', 'de'] as const,
  defaultLocale: 'sr',
  // Serbian at root (no prefix), others prefixed.
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]

// Native display names for the language switcher.
export const LOCALE_NAMES: Record<Locale, string> = {
  sr: 'Srpski',
  en: 'English',
  ru: 'Русский',
  ro: 'Română',
  hu: 'Magyar',
  de: 'Deutsch',
}
