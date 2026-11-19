import { unstable_noStore as noStore } from 'next/cache'
import type { Where } from 'payload'

import type { Locale } from '@/i18n/config'
import { STOREFRONT_REVALIDATE, STOREFRONT_TAGS, cacheByLocale, cacheBySlug, cacheWithKey } from '@/lib/cache/storefront'
import { getPublicAddress, getPublicEmail, getPublicPhone, getPublicWhatsappNumber } from '@/lib/contact'
import { getPayloadClient } from '@/lib/payload/getPayload'

import type {
  BrandItem,
  CategoryItem,
  HomepageData,
  HomepageSectionsData,
  ID,
  MediaItem,
  ProductItem,
  ProductListing,
  ProductQuery,
  SiteSettingsData
} from './types'

type Relation<T> = ID | T | null | undefined

type MediaDoc = {
  id: ID
  altAr?: string
  altFr?: string
  height?: number
  url?: string
  width?: number
}

type CategoryDoc = {
  id: ID
  name?: string
  slug?: string
  description?: string
  longDescription?: unknown
  image?: Relation<MediaDoc>
  icon?: string
  displayOrder?: number
  featured?: boolean
  showOnHomepage?: boolean
  parent?: Relation<Pick<CategoryDoc, 'id' | 'name' | 'slug'>>
  seo?: {
    description?: string
    title?: string
    noIndex?: boolean
  }
}

type BrandDoc = {
  id: ID
  name?: string
  slug?: string
  logo?: Relation<MediaDoc>
}

type ProductDoc = {
  id: ID
  active?: boolean
  name?: string
  slug?: string
  sku?: string
  manufacturerReference?: string
  barcode?: string
  shortDescription?: string
  fullDescription?: string
  category?: Relation<CategoryDoc>
  brand?: Relation<BrandDoc>
  images?: Relation<MediaDoc>[]
  publicPrice?: number
  previousPrice?: number
  vatRate?: number
  stockQuantity?: number
  reservedStock?: number
  lowStockThreshold?: number
  stockStatus?: ProductItem['stockStatus']
  unit?: ProductItem['unit']
  minimumOrderQuantity?: number
  quantityIncrement?: number
  featured?: boolean
  newProduct?: boolean
  promotionalProduct?: boolean
  technicalAttributes?: Array<{
    label?: string
    value?: string
    unit?: string
  }>
  seo?: {
    title?: string
    description?: string
  }
}

type HomepageGlobalDoc = {
  announcementText?: string
  heroTitle?: string
  heroSubtitle?: string
  heroCtaLabel?: string
  heroCtaUrl?: string
  featuredCategories?: Relation<CategoryDoc>[]
  featuredProducts?: Relation<ProductDoc>[]
  featuredBrands?: Relation<BrandDoc>[]
  benefits?: Array<{ title?: string; description?: string }>
}

type SiteSettingsGlobalDoc = {
  siteName?: string
  phone?: string
  whatsappNumber?: string
  email?: string
  address?: string
  socialLinks?: Array<{ label?: string; url?: string }>
  header?: {
    searchPlaceholder?: string
  }
  footer?: {
    copyrightText?: string
  }
  defaultSeo?: {
    title?: string
    description?: string
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const PUBLISHED_PRODUCT: Where = { active: { equals: true } }

function resolveRelation<T extends { id: ID }>(value: Relation<T>): T | undefined {
  return isObject(value) && 'id' in value ? (value as T) : undefined
}

function normalizeMediaUrl(url?: string) {
  if (!url) {
    return undefined
  }

  if (url.startsWith('/')) {
    return url
  }

  try {
    const parsed = new URL(url)

    if (['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    return url
  }

  return url
}

function mapMedia(media: Relation<MediaDoc>, locale: Locale): MediaItem | undefined {
  const doc = resolveRelation(media)

  if (!doc) {
    return undefined
  }

  return {
    alt: locale === 'ar' ? doc.altAr || doc.altFr : doc.altFr || doc.altAr,
    height: doc.height,
    id: doc.id,
    url: normalizeMediaUrl(doc.url),
    width: doc.width
  }
}

function mapCategory(category: Relation<CategoryDoc>, locale: Locale): CategoryItem | undefined {
  const doc = resolveRelation(category)

  if (!doc || !doc.name || !doc.slug) {
    return undefined
  }

  const parent = resolveRelation(doc.parent)

  return {
    children: [],
    displayOrder: doc.displayOrder,
    featured: doc.featured,
    id: doc.id,
    icon: doc.icon,
    image: mapMedia(doc.image, locale),
    longDescription: doc.longDescription,
    name: doc.name,
    parent: parent && parent.name && parent.slug ? { id: parent.id, name: parent.name, slug: parent.slug } : undefined,
    seo: doc.seo
      ? {
          metaDescription: doc.seo.description,
          metaTitle: doc.seo.title,
          noIndex: doc.seo.noIndex
        }
      : undefined,
    shortDescription: doc.description,
    showOnHomepage: doc.showOnHomepage,
    slug: doc.slug
  }
}

function mapBrand(brand: Relation<BrandDoc>, locale: Locale): BrandItem | undefined {
  const doc = resolveRelation(brand)

  if (!doc || !doc.name || !doc.slug) {
    return undefined
  }

  return {
    id: doc.id,
    logo: mapMedia(doc.logo, locale),
    name: doc.name,
    slug: doc.slug
  }
}

function mapProduct(product: ProductDoc, locale: Locale): ProductItem | undefined {
  if (!product.name || !product.slug || !product.sku || typeof product.publicPrice !== 'number') {
    return undefined
  }

  return {
    brand: mapBrand(product.brand, locale),
    category: mapCategory(product.category, locale),
    featured: product.featured,
    fullDescription: product.fullDescription,
    id: product.id,
    images: product.images?.map((image) => mapMedia(image, locale)).filter((image): image is MediaItem => Boolean(image)) ?? [],
    barcode: product.barcode,
    manufacturerReference: product.manufacturerReference,
    minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
    name: product.name,
    newProduct: product.newProduct,
    previousPrice: product.previousPrice,
    promotionalProduct: product.promotionalProduct,
    publicPrice: product.publicPrice,
    quantityIncrement: product.quantityIncrement ?? 1,
    seoDescription: product.seo?.description,
    seoTitle: product.seo?.title,
    shortDescription: product.shortDescription,
    sku: product.sku,
    slug: product.slug,
    lowStockThreshold: product.lowStockThreshold,
    reservedStock: product.reservedStock,
    stockQuantity: product.stockQuantity ?? 0,
    stockStatus: product.stockStatus ?? 'out_of_stock',
    technicalAttributes:
      product.technicalAttributes
        ?.filter((attribute) => attribute.label && attribute.value)
        .map((attribute) => ({
          label: attribute.label ?? '',
          unit: attribute.unit,
          value: attribute.value ?? ''
        })) ?? [],
    unit: product.unit ?? 'piece',
    vatRate: product.vatRate ?? 19
  }
}

async function getDirectChildIds(locale: Locale, parentIds: ID[]): Promise<Map<ID, ID[]>> {
  const children = new Map<ID, ID[]>(parentIds.map((id) => [id, []]))

  if (parentIds.length === 0) {
    return children
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 500,
    locale,
    pagination: false,
    where: { parent: { in: parentIds } }
  })

  ;(result.docs as Array<{ id: ID; parent?: ID | { id: ID } | null }>).forEach((doc) => {
    const parentId = typeof doc.parent === 'object' && doc.parent ? doc.parent.id : doc.parent
    const key = parentIds.find((id) => String(id) === String(parentId))

    if (key !== undefined) {
      children.get(key)?.push(doc.id)
    }
  })

  return children
}

/** A category's listing scope: the category itself plus its direct subcategories. */
export async function getCategoryScopeIds(locale: Locale, categoryId: ID): Promise<ID[]> {
  try {
    const children = await getDirectChildIds(locale, [categoryId])
    return [categoryId, ...(children.get(categoryId) ?? [])]
  } catch {
    return [categoryId]
  }
}

async function getProductCountByCategoryIds(locale: Locale, categoryIds: ID[]) {
  if (categoryIds.length === 0) {
    return new Map<ID, number>()
  }

  const payload = await getPayloadClient()
  const children = await getDirectChildIds(locale, categoryIds)
  const entries = await Promise.all(
    categoryIds.map(async (categoryId) => {
      // Same scope and published rule as the category listing page, so the counts match it.
      const result = await payload.count({
        collection: 'products',
        locale,
        where: {
          and: [PUBLISHED_PRODUCT, { category: { in: [categoryId, ...(children.get(categoryId) ?? [])] } }]
        }
      })

      return [categoryId, result.totalDocs] as const
    })
  )

  return new Map(entries)
}

async function withProductCounts(locale: Locale, categories: CategoryItem[]) {
  const counts = await getProductCountByCategoryIds(
    locale,
    categories.map((category) => category.id)
  )

  return categories.map((category) => ({
    ...category,
    productCount: counts.get(category.id) ?? 0
  }))
}

async function getHomepageProductCollection({
  limit,
  locale,
  sort,
  where
}: {
  limit: number
  locale: Locale
  sort: string
  where: Where
}): Promise<ProductItem[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      depth: 2,
      limit,
      locale,
      sort,
      where: { and: [PUBLISHED_PRODUCT, where] }
    })

    return (result.docs as ProductDoc[])
      .map((product) => mapProduct(product, locale))
      .filter((product): product is ProductItem => Boolean(product))
  } catch {
    return []
  }
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsData> {
  return cacheByLocale(
    'site-settings',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const settings = (await payload.findGlobal({
          slug: 'site-settings',
          locale
        })) as SiteSettingsGlobalDoc

        return {
          // Placeholder/seed contact values are dropped so they never reach the public UI.
          address: getPublicAddress(settings.address),
          copyrightText: settings.footer?.copyrightText,
          defaultSeoDescription: settings.defaultSeo?.description,
          defaultSeoTitle: settings.defaultSeo?.title,
          email: getPublicEmail(settings.email),
          phone: getPublicPhone(settings.phone) ? settings.phone : undefined,
          searchPlaceholder: settings.header?.searchPlaceholder,
          siteName: settings.siteName || 'Amous',
          socialLinks:
            settings.socialLinks
              ?.filter((link): link is { label: string; url: string } => Boolean(link.label?.trim() && link.url && /^https:\/\/\S+$/i.test(link.url.trim())))
              .map((link) => ({ label: link.label.trim(), url: link.url.trim() })) ?? [],
          whatsappNumber: getPublicWhatsappNumber(settings.whatsappNumber)
        }
      } catch {
        return {
          siteName: 'Amous'
        }
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.siteSettings,
      tags: [STOREFRONT_TAGS.siteSettings]
    }
  )
}

export async function getHomepage(locale: Locale): Promise<HomepageData | null> {
  return cacheByLocale(
    'homepage-global',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const homepage = (await payload.findGlobal({
          depth: 2,
          slug: 'homepage',
          locale
        })) as HomepageGlobalDoc

        if (!homepage.heroTitle) {
          return null
        }

        return {
          announcementText: homepage.announcementText,
          benefits:
            homepage.benefits
              ?.filter((benefit) => benefit.title)
              .map((benefit) => ({ description: benefit.description, title: benefit.title ?? '' })) ?? [],
          featuredBrands:
            homepage.featuredBrands
              ?.map((brand) => mapBrand(brand, locale))
              .filter((brand): brand is BrandItem => Boolean(brand)) ?? [],
          featuredCategories:
            homepage.featuredCategories
              ?.map((category) => mapCategory(category, locale))
              .filter((category): category is CategoryItem => Boolean(category)) ?? [],
          featuredProducts:
            homepage.featuredProducts
              ?.map((product) => resolveRelation(product))
              .map((product) => (product && product.active !== false ? mapProduct(product, locale) : undefined))
              .filter((product): product is ProductItem => Boolean(product))
              .slice(0, 12) ?? [],
          heroCtaLabel: homepage.heroCtaLabel,
          heroCtaUrl: homepage.heroCtaUrl,
          heroSubtitle: homepage.heroSubtitle,
          heroTitle: homepage.heroTitle
        }
      } catch {
        return null
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.homepage,
      tags: [STOREFRONT_TAGS.homepage]
    }
  )
}

export async function getCategories(locale: Locale, parentId?: ID): Promise<CategoryItem[]> {
  return cacheWithKey(
    ['categories', locale, parentId ? String(parentId) : 'root'],
    async () => {
      try {
        const payload = await getPayloadClient()
        const where: Where = parentId
          ? { parent: { equals: parentId } }
          : {
              or: [{ parent: { exists: false } }, { parent: { equals: null } }]
            }

        const result = await payload.find({
          collection: 'categories',
          depth: 1,
          limit: 100,
          locale,
          sort: 'displayOrder',
          where
        })

        return (result.docs as CategoryDoc[])
          .map((category) => mapCategory(category, locale))
          .filter((category): category is CategoryItem => Boolean(category))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.categories,
      tags: [STOREFRONT_TAGS.categories]
    }
  )
}

export async function getHomepageCategories(locale: Locale): Promise<CategoryItem[]> {
  return cacheByLocale(
    'homepage-categories',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'categories',
          depth: 1,
          limit: 8,
          locale,
          sort: 'displayOrder',
          where: {
            and: [
              {
                showOnHomepage: {
                  equals: true
                }
              },
              {
                or: [{ parent: { exists: false } }, { parent: { equals: null } }]
              }
            ]
          }
        })

        const categories = (result.docs as CategoryDoc[])
          .map((category) => mapCategory(category, locale))
          .filter((category): category is CategoryItem => Boolean(category))

        return withProductCounts(locale, categories)
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.homepage,
      tags: [STOREFRONT_TAGS.categories, STOREFRONT_TAGS.homepage]
    }
  )
}

export async function getAllParentCategories(locale: Locale): Promise<CategoryItem[]> {
  return cacheByLocale(
    'all-parent-categories',
    locale,
    async () => {
      try {
        const [parents, allChildren] = await Promise.all([getCategories(locale), getCategoriesWithParents(locale)])
        const childGroups = new Map<ID, Array<{ id: ID; name: string; slug: string }>>()

        allChildren.forEach((category) => {
          if (!category.parent) {
            return
          }

          const group = childGroups.get(category.parent.id) ?? []
          group.push({ id: category.id, name: category.name, slug: category.slug })
          childGroups.set(category.parent.id, group)
        })

        const withCounts = await withProductCounts(locale, parents)

        return withCounts.map((category) => ({
          ...category,
          children: childGroups.get(category.id) ?? []
        }))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.categories,
      tags: [STOREFRONT_TAGS.categories]
    }
  )
}

export async function getCategoryOverview(locale: Locale): Promise<CategoryItem[]> {
  return cacheByLocale(
    'category-overview',
    locale,
    async () => {
      try {
        const [parents, allChildren] = await Promise.all([getActiveParentCategories(locale), getActiveCategoriesWithParents(locale)])
        const childGroups = new Map<ID, Array<{ id: ID; name: string; slug: string }>>()

        allChildren.forEach((category) => {
          if (!category.parent) {
            return
          }

          const group = childGroups.get(category.parent.id) ?? []
          group.push({ id: category.id, name: category.name, slug: category.slug })
          childGroups.set(category.parent.id, group)
        })

        return parents.map((category) => ({
          ...category,
          children: (childGroups.get(category.id) ?? []).slice(0, 3)
        }))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.categories,
      tags: [STOREFRONT_TAGS.categories]
    }
  )
}

async function getActiveParentCategories(locale: Locale): Promise<CategoryItem[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    draft: false,
    limit: 100,
    locale,
    sort: 'displayOrder',
    where: {
      and: [
        {
          active: {
            equals: true
          }
        },
        {
          or: [{ parent: { exists: false } }, { parent: { equals: null } }]
        }
      ]
    }
  })

  return (result.docs as CategoryDoc[])
    .map((category) => mapCategory(category, locale))
    .filter((category): category is CategoryItem => Boolean(category))
}

async function getActiveCategoriesWithParents(locale: Locale): Promise<CategoryItem[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    draft: false,
    limit: 200,
    locale,
    sort: 'displayOrder',
    where: {
      and: [
        {
          active: {
            equals: true
          }
        },
        {
          parent: {
            exists: true
          }
        }
      ]
    }
  })

  return (result.docs as CategoryDoc[])
    .map((category) => mapCategory(category, locale))
    .filter((category): category is CategoryItem => Boolean(category))
}

async function getCategoriesWithParents(locale: Locale): Promise<CategoryItem[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 200,
    locale,
    sort: 'displayOrder'
  })

  return (result.docs as CategoryDoc[])
    .map((category) => mapCategory(category, locale))
    .filter((category): category is CategoryItem => Boolean(category))
}

export async function getFeaturedBrands(locale: Locale): Promise<BrandItem[]> {
  return cacheByLocale(
    'featured-brands',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'brands',
          depth: 1,
          limit: 12,
          locale,
          sort: 'name',
          where: {
            featured: {
              equals: true
            }
          }
        })

        return (result.docs as BrandDoc[])
          .map((brand) => mapBrand(brand, locale))
          .filter((brand): brand is BrandItem => Boolean(brand))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.brands,
      tags: [STOREFRONT_TAGS.brands, STOREFRONT_TAGS.homepage]
    }
  )
}

export async function getBrands(locale: Locale): Promise<BrandItem[]> {
  return cacheByLocale(
    'brands',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'brands',
          depth: 1,
          limit: 100,
          locale,
          sort: 'name'
        })

        return (result.docs as BrandDoc[])
          .map((brand) => mapBrand(brand, locale))
          .filter((brand): brand is BrandItem => Boolean(brand))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.brands,
      tags: [STOREFRONT_TAGS.brands]
    }
  )
}

export async function getCategoryBySlug(locale: Locale, slug: string): Promise<CategoryItem | null> {
  return cacheBySlug(
    'category-by-slug',
    locale,
    slug,
    async () => {
      try {
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'categories',
          depth: 1,
          limit: 1,
          locale,
          where: {
            slug: {
              equals: slug
            }
          }
        })

        return mapCategory(result.docs[0] as CategoryDoc | undefined, locale) ?? null
      } catch {
        return null
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.categories,
      tags: [STOREFRONT_TAGS.categories, `category:${slug}`]
    }
  )
}

export async function getRelatedCategories(locale: Locale, category: CategoryItem, limit = 4): Promise<CategoryItem[]> {
  return cacheWithKey(
    ['related-categories', locale, String(category.id), String(limit)],
    async () => {
      try {
        const pool = category.parent ? await getCategories(locale, category.parent.id) : await getCategories(locale)
        return pool.filter((entry) => String(entry.id) !== String(category.id)).slice(0, limit)
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.categories,
      tags: [STOREFRONT_TAGS.categories, `category:${category.slug}`]
    }
  )
}

export async function getHomepageSections(locale: Locale): Promise<HomepageSectionsData> {
  return cacheByLocale(
    'homepage-sections',
    locale,
    async () => {
      const homepage = await getHomepage(locale)
      const bestSellingFromHomepage = homepage?.featuredProducts.slice(0, 8) ?? []
      const partnerBrandsFromHomepage = homepage?.featuredBrands.slice(0, 12) ?? []

      const [mainCategories, fallbackBestSellingProducts, currentPromotions, fallbackPartnerBrands, newProducts] = await Promise.all([
        getHomepageCategories(locale),
        bestSellingFromHomepage.length > 0
          ? Promise.resolve([] as ProductItem[])
          : getHomepageProductCollection({
              limit: 8,
              locale,
              sort: '-updatedAt',
              where: {
                and: [{ featured: { equals: true } }, { stockStatus: { not_equals: 'out_of_stock' } }]
              }
            }),
        getHomepageProductCollection({
          limit: 2,
          locale,
          sort: '-updatedAt',
          where: {
            and: [{ promotionalProduct: { equals: true } }, { stockStatus: { not_equals: 'out_of_stock' } }]
          }
        }),
        partnerBrandsFromHomepage.length > 0 ? Promise.resolve([] as BrandItem[]) : getFeaturedBrands(locale),
        getHomepageProductCollection({
          limit: 8,
          locale,
          sort: '-createdAt',
          where: {
            and: [{ newProduct: { equals: true } }, { stockStatus: { not_equals: 'out_of_stock' } }]
          }
        })
      ])

      return {
        bestSellingProducts: bestSellingFromHomepage.length > 0 ? bestSellingFromHomepage : fallbackBestSellingProducts,
        currentPromotions,
        mainCategories,
        newProducts,
        partnerBrands: partnerBrandsFromHomepage.length > 0 ? partnerBrandsFromHomepage : fallbackPartnerBrands.slice(0, 12)
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.homepage,
      tags: [STOREFRONT_TAGS.homepage, STOREFRONT_TAGS.categories, STOREFRONT_TAGS.brands, STOREFRONT_TAGS.promotions, STOREFRONT_TAGS.products]
    }
  )
}

function getSort(sort?: string): string {
  switch (sort) {
    case 'price-asc':
      return 'publicPrice'
    case 'price-desc':
      return '-publicPrice'
    case 'new':
      return '-createdAt'
    case 'name':
      return 'name'
    case 'promotions':
      return '-promotionalProduct'
    default:
      return '-featured'
  }
}

async function getBrandIdsBySlugs(locale: Locale, slugs: string[]): Promise<ID[]> {
  if (slugs.length === 0) {
    return []
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'brands',
    limit: Math.min(slugs.length, 100),
    locale,
    where: {
      slug: {
        in: slugs
      }
    }
  })

  return (result.docs as BrandDoc[]).map((brand) => brand.id)
}

export async function getProducts(query: ProductQuery): Promise<ProductListing> {
  noStore()

  try {
    const payload = await getPayloadClient()
    // The Local API bypasses collection access rules, so the storefront must apply the
    // "Publié" (active) rule itself — otherwise unpublished products are listed and counted.
    const and: Where[] = [PUBLISHED_PRODUCT]

    if (query.categoryIds?.length) {
      and.push({ category: { in: query.categoryIds } })
    } else if (query.categoryId) {
      and.push({ category: { equals: query.categoryId } })
    }

    const requestedBrandSlugs = query.brandSlugs ?? (query.brandSlug ? [query.brandSlug] : [])
    const brandIds = await getBrandIdsBySlugs(query.locale, requestedBrandSlugs)
    if (brandIds.length > 0) {
      and.push({ brand: { in: brandIds } })
    } else if (requestedBrandSlugs.length > 0) {
      and.push({ id: { exists: false } })
    }

    if (typeof query.minPrice === 'number') {
      and.push({ publicPrice: { greater_than_equal: query.minPrice } })
    }

    if (typeof query.maxPrice === 'number') {
      and.push({ publicPrice: { less_than_equal: query.maxPrice } })
    }

    if (query.stockStatuses?.length) {
      and.push({ stockStatus: { in: query.stockStatuses } })
    } else if (query.inStock) {
      and.push({ stockStatus: { not_equals: 'out_of_stock' } })
    }

    if (query.promotion) {
      and.push({ promotionalProduct: { equals: true } })
    }

    if (query.newProduct) {
      and.push({ newProduct: { equals: true } })
    }

    if (query.featured) {
      and.push({ featured: { equals: true } })
    }

    const search = query.search?.trim().slice(0, 80)
    if (search) {
      const matchingBrands = await payload.find({
        collection: 'brands',
        limit: 50,
        locale: query.locale,
        where: { name: { like: search } }
      })
      const matchingBrandIds = (matchingBrands.docs as BrandDoc[]).map((brand) => brand.id)
      const or: Where[] =
        query.searchScope === 'nameAndReference'
          ? [{ name: { like: search } }, { sku: { like: search } }, { manufacturerReference: { like: search } }]
          : [{ name: { like: search } }, { sku: { like: search } }, { manufacturerReference: { like: search } }, { shortDescription: { like: search } }]

      if (matchingBrandIds.length > 0 && query.searchScope !== 'nameAndReference') {
        or.push({ brand: { in: matchingBrandIds } })
      }

      and.push({ or })
    }

    const where: Where = and.length > 0 ? { and } : {}
    const result = await payload.find({
      collection: 'products',
      depth: 2,
      limit: query.pageSize ?? 12,
      locale: query.locale,
      page: query.page ?? 1,
      sort: getSort(query.sort),
      where
    })

    return {
      page: result.page ?? 1,
      products: (result.docs as ProductDoc[])
        .map((product) => mapProduct(product, query.locale))
        .filter((product): product is ProductItem => Boolean(product)),
      totalDocs: result.totalDocs,
      totalPages: result.totalPages
    }
  } catch {
    return {
      page: 1,
      products: [],
      totalDocs: 0,
      totalPages: 0
    }
  }
}

export async function getProductBySlug(locale: Locale, slug: string): Promise<ProductItem | null> {
  return cacheBySlug(
    'product-by-slug',
    locale,
    slug,
    async () => {
      try {
        const payload = await getPayloadClient()
        const result = await payload.find({
          collection: 'products',
          depth: 2,
          limit: 1,
          locale,
          where: {
            slug: {
              equals: slug
            }
          }
        })

        const doc = result.docs[0] as ProductDoc | undefined
        return doc ? mapProduct(doc, locale) ?? null : null
      } catch {
        return null
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.product,
      tags: [STOREFRONT_TAGS.products, `product:${slug}`]
    }
  )
}

export async function searchProducts(locale: Locale, rawQuery: string): Promise<ProductItem[]> {
  noStore()

  const query = rawQuery.trim().slice(0, 80)
  if (!query) {
    return []
  }

  try {
    const payload = await getPayloadClient()
    const matchingBrands = await payload.find({
      collection: 'brands',
      limit: 10,
      locale,
      where: {
        name: {
          like: query
        }
      }
    })
    const brandIds = (matchingBrands.docs as BrandDoc[]).map((brand) => brand.id)

    const or: Where[] = [{ name: { like: query } }, { sku: { like: query } }, { shortDescription: { like: query } }]

    if (brandIds.length > 0) {
      or.push({ brand: { in: brandIds } })
    }

    const result = await payload.find({
      collection: 'products',
      depth: 2,
      limit: 24,
      locale,
      where: {
        or
      }
    })

    return (result.docs as ProductDoc[])
      .map((product) => mapProduct(product, locale))
      .filter((product): product is ProductItem => Boolean(product))
  } catch {
    return []
  }
}

export type CategoryListingFacets = {
  brands: Array<BrandItem & { count: number }>
  price?: { max: number; min: number }
  stock: Record<ProductItem['stockStatus'], number>
}

/**
 * Filter options that actually apply to a category scope: brands present (with counts),
 * the price span, and stock-status counts. Reads only three columns of published products.
 */
export async function getCategoryListingFacets(locale: Locale, categoryIds: ID[]): Promise<CategoryListingFacets> {
  const empty: CategoryListingFacets = { brands: [], stock: { in_stock: 0, low_stock: 0, out_of_stock: 0 } }

  if (categoryIds.length === 0) {
    return empty
  }

  return cacheWithKey(
    ['category-facets', locale, categoryIds.map(String).join(',')],
    async () => {
      try {
        const payload = await getPayloadClient()
        const [productsResult, brands] = await Promise.all([
          payload.find({
            collection: 'products',
            depth: 0,
            locale,
            pagination: false,
            select: { brand: true, publicPrice: true, stockStatus: true },
            where: { and: [PUBLISHED_PRODUCT, { category: { in: categoryIds } }] }
          }),
          getBrands(locale)
        ])

        const brandCounts = new Map<string, number>()
        const stock = { ...empty.stock }
        let min = Number.POSITIVE_INFINITY
        let max = 0

        ;(productsResult.docs as Array<{ brand?: ID | { id: ID } | null; publicPrice?: number; stockStatus?: ProductItem['stockStatus'] }>).forEach((doc) => {
          const brandId = typeof doc.brand === 'object' && doc.brand ? doc.brand.id : doc.brand
          if (brandId !== undefined && brandId !== null) {
            brandCounts.set(String(brandId), (brandCounts.get(String(brandId)) ?? 0) + 1)
          }
          if (doc.stockStatus && doc.stockStatus in stock) {
            stock[doc.stockStatus] += 1
          }
          if (typeof doc.publicPrice === 'number') {
            min = Math.min(min, doc.publicPrice)
            max = Math.max(max, doc.publicPrice)
          }
        })

        return {
          brands: brands
            .filter((brand) => brandCounts.has(String(brand.id)))
            .map((brand) => ({ ...brand, count: brandCounts.get(String(brand.id)) ?? 0 })),
          price: Number.isFinite(min) ? { max, min } : undefined,
          stock
        }
      } catch {
        return empty
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.product,
      tags: [STOREFRONT_TAGS.products, STOREFRONT_TAGS.brands, STOREFRONT_TAGS.categories]
    }
  )
}

