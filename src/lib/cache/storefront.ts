import { revalidateTag, unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'

export const STOREFRONT_TAGS = {
  brands: 'brands',
  categories: 'categories',
  deliveryConfig: 'delivery-config',
  header: 'header',
  hero: 'hero',
  homepage: 'homepage',
  products: 'products',
  promotions: 'promotions',
  siteSettings: 'site-settings'
} as const

export const STOREFRONT_REVALIDATE = {
  brands: 60 * 60,
  categories: 60 * 60,
  deliveryConfig: 60 * 60,
  header: 60 * 60,
  hero: 30 * 60,
  homepage: 10 * 60,
  product: 5 * 60,
  siteSettings: 60 * 60
} as const

export function cacheWithKey<T>(keyParts: string[], loader: () => Promise<T>, options: { revalidate: number; tags: string[] }) {
  return unstable_cache(loader, keyParts, options)()
}

export function cacheByLocale<T>(key: string, locale: Locale, loader: () => Promise<T>, options: { revalidate: number; tags: string[] }) {
  return unstable_cache(loader, [key, locale], options)()
}

export function cacheBySlug<T>(
  key: string,
  locale: Locale,
  slug: string,
  loader: () => Promise<T>,
  options: { revalidate: number; tags: string[] }
) {
  return unstable_cache(loader, [key, locale, slug], options)()
}

export async function revalidateStorefrontTags(tags: string[]) {
  const uniqueTags = [...new Set(tags)]

  await Promise.all(uniqueTags.map((tag) => revalidateTag(tag, 'max')))
}
