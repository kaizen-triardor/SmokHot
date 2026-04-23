'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing, LOCALE_NAMES, type Locale } from '@/i18n/routing'
import { useState, useRef, useEffect, useTransition } from 'react'
import { GlobeAltIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface Props {
  variant?: 'desktop' | 'mobile'
  onSelect?: () => void
}

export default function LanguageSwitcher({ variant = 'desktop', onSelect }: Props) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleSelect = (next: Locale) => {
    if (next === locale) {
      setOpen(false)
      onSelect?.()
      return
    }
    startTransition(() => {
      // Same pathname under the new locale; next-intl handles the prefix.
      router.replace(pathname, { locale: next })
    })
    setOpen(false)
    onSelect?.()
  }

  if (variant === 'mobile') {
    // Inline list in mobile drawer — no dropdown, shows all options.
    return (
      <div className="space-y-1" aria-label="Language">
        <div className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          <GlobeAltIcon className="mr-2 inline h-4 w-4" aria-hidden="true" />
          {LOCALE_NAMES[locale]}
        </div>
        {routing.locales.map((l) => {
          const active = l === locale
          return (
            <button
              key={l}
              type="button"
              onClick={() => handleSelect(l)}
              disabled={isPending}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition ${
                active
                  ? 'bg-ember-500/15 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{LOCALE_NAMES[l]}</span>
              {active && <CheckIcon className="h-4 w-4 text-ember-500" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    )
  }

  // Desktop dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-bold uppercase tracking-[0.1em] text-white/80 transition hover:text-white"
      >
        <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-[160px] rounded-lg border border-white/10 bg-[#141418] py-1 shadow-xl ring-1 ring-black/30"
        >
          {routing.locales.map((l) => {
            const active = l === locale
            return (
              <li key={l} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => handleSelect(l)}
                  disabled={isPending}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'bg-ember-500/10 font-bold text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{LOCALE_NAMES[l]}</span>
                  {active && <CheckIcon className="h-4 w-4 text-ember-500" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
