import type { MetadataRoute } from 'next'

import { getBrands, getCategories, getProducts } from '@/features/catalogue/data'
import { locales } from '@/i18n/config'
import { getPublicSiteUrl } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    entries.push(
      { changeFrequency: 'daily', priority: 1, url: `${siteUrl}/${locale}` },
      { changeFrequency: 'daily', priority: 0.9, url: `${siteUrl}/${locale}/boutique` },
      { changeFrequency: 'weekly', priority: 0.85, url: `${siteUrl}/${locale}/nos-categories` },
      { changeFrequency: 'weekly', priority: 0.8, url: `${siteUrl}/${locale}/marques` }
    )

    const [categories, products, brands] = await Promise.all([
      getCategories(locale),
      getProducts({ locale, page: 1 }),
      // Active brands only (getBrands filters inactive ones).
      getBrands(locale)
    ])

    brands.forEach((brand) => {
      entries.push({
        changeFrequency: 'weekly',
        priority: 0.7,
        url: `${siteUrl}/${locale}/marques/${encodeURIComponent(brand.slug)}`
      })
    })

    categories.forEach((category) => {
      entries.push({
        changeFrequency: 'weekly',
        priority: 0.8,
        url: `${siteUrl}/${locale}/c/${category.slug}`
      })
    })

    products.products.forEach((product) => {
      entries.push({
        changeFrequency: 'weekly',
        priority: 0.7,
        url: `${siteUrl}/${locale}/p/${product.slug}`
      })
    })
  }

  return entries
}
