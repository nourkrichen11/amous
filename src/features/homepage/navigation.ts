import type { Locale } from '@/i18n/config'

import type { HeaderNavItem } from './types'

// Labels the "Brands" entry has shipped with (seed data + translations), compared case-insensitively.
const BRAND_LABELS = new Set(['marques', 'nos marques', 'brands', 'العلامات', 'العلامات التجارية', 'علاماتنا التجارية'])

function pathOf(url: string) {
  return url.trim().split(/[?#]/)[0].replace(/\/+$/, '') || '/'
}

/**
 * Existing CMS installs were seeded with a "Marques" header link pointing to `/boutique`.
 * Now that `/{locale}/marques` exists, that legacy entry is pointed at the brand directory.
 * Only an entry whose label is a Brands label AND whose URL is exactly the shop root
 * (no query/hash) is rewritten, so the separate Boutique link, `/boutique?…` links and any
 * custom navigation are preserved.
 */
export function upgradeLegacyBrandsLink(item: HeaderNavItem, locale: Locale): HeaderNavItem {
  const label = item.label.trim().toLocaleLowerCase('fr')
  const url = item.url.trim()
  const isShopRoot = !/[?#]/.test(url) && /^(\/(fr|ar))?\/boutique$/.test(pathOf(url))

  if (!BRAND_LABELS.has(label) || !isShopRoot) {
    return item
  }

  return { ...item, id: 'brands', url: `/${locale}/marques` }
}
