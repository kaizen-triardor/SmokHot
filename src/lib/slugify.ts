/**
 * slugify — canonical URL-slug generator for the whole app.
 *
 * Transliterates Serbian diacritics (š → s, đ → dj, etc.) so URLs are
 * ASCII-safe and universally shareable. Replaces spaces and punctuation
 * with single hyphens, trims leading/trailing hyphens, lowercases.
 *
 * Three admin routes previously had three different slug implementations;
 * this file replaces all of them.
 */

const DIACRITIC_MAP: Record<string, string> = {
  'š': 's', 'Š': 'S',
  'đ': 'dj', 'Đ': 'Dj',
  'č': 'c', 'Č': 'C',
  'ć': 'c', 'Ć': 'C',
  'ž': 'z', 'Ž': 'Z',
  'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a',
  'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
  'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
  'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
  'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
  'ñ': 'n', 'ý': 'y',
}

export function slugify(input: string): string {
  if (!input) return ''
  // Transliterate diacritics
  let s = ''
  for (const ch of input) {
    s += DIACRITIC_MAP[ch] ?? ch
  }
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // collapse any non-alphanumeric to single hyphen
    .replace(/^-+|-+$/g, '')     // trim leading/trailing hyphens
}
