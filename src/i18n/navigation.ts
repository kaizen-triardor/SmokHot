import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Drop-in replacements for next/link + next/navigation that automatically
// handle the locale prefix. Import these instead of next/* in any component
// that navigates within the site.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
