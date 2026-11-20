import { getPayloadClient } from '@/lib/payload/getPayload'
import { STOREFRONT_REVALIDATE, STOREFRONT_TAGS, cacheByLocale } from '@/lib/cache/storefront'
import type { MediaItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

import { upgradeLegacyBrandsLink } from './navigation'
import type { HeaderData, HeaderNavItem, HeroSlide } from './types'

type MediaDoc = {
  id: string | number
  altAr?: string
  altFr?: string
  height?: number
  url?: string
  width?: number
}

type HeaderGlobalDoc = {
  announcementText?: string
  logo?: MediaDoc | string | number | null
  navigationItems?: Array<{
    id?: string
    isCategoryTrigger?: boolean
    label?: string
    url?: string
  }>
  searchPlaceholder?: string
  showAccount?: boolean
  showCart?: boolean
  showWishlist?: boolean
  stickyHeaderEnabled?: boolean
}

type HeroSlideDoc = {
  id: string | number
  eyebrow?: string
  title?: string
  subtitle?: string
  desktopImage?: MediaDoc | string | number | null
  mobileImage?: MediaDoc | string | number | null
  primaryCtaLabel?: string
  primaryCtaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  textAlignment?: HeroSlide['textAlignment']
  contentPosition?: HeroSlide['contentPosition']
  textTheme?: HeroSlide['textTheme']
  overlayStrength?: HeroSlide['overlayStrength']
}

function getFallbackNavigation(locale: Locale): HeaderNavItem[] {
  return [
    { id: 'home', label: t(locale, 'navigation.home'), url: `/${locale}` },
    { id: 'shop', label: t(locale, 'navigation.shop'), url: `/${locale}/boutique` },
    { id: 'categories', isCategoryTrigger: true, label: t(locale, 'navigation.categories'), url: `/${locale}/nos-categories` },
    { id: 'brands', label: t(locale, 'navigation.brands'), url: `/${locale}/marques` },
    { id: 'promotions', label: t(locale, 'navigation.promotions'), url: `/${locale}/boutique?promotion=1` },
    { id: 'new', label: t(locale, 'navigation.newArrivals'), url: `/${locale}/boutique?sort=new` },
    { id: 'pro', label: t(locale, 'navigation.professionals'), url: `/${locale}/recherche?q=pro` },
    { id: 'about', label: t(locale, 'navigation.about'), url: `/${locale}/recherche?q=amous` },
    { id: 'contact', label: t(locale, 'navigation.contact'), url: `/${locale}/recherche?q=contact` }
  ]
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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

function resolveMedia(value: MediaDoc | string | number | null | undefined, locale: Locale): MediaItem | undefined {
  if (!isObject(value) || !('id' in value)) {
    return undefined
  }

  const media = value as MediaDoc

  return {
    alt: locale === 'ar' ? media.altAr || media.altFr : media.altFr || media.altAr,
    height: media.height,
    id: media.id,
    url: normalizeMediaUrl(media.url),
    width: media.width
  }
}

function mapNavigation(locale: Locale, items?: HeaderGlobalDoc['navigationItems']): HeaderNavItem[] {
  const mapped =
    items
      ?.filter((item) => item.label && item.url)
      .map((item, index) => ({
        id: item.id || `nav-${index}`,
        isCategoryTrigger: item.isCategoryTrigger,
        label: item.label || '',
        url: item.url || '#'
      }))
      .map((item) => upgradeLegacyBrandsLink(item, locale)) ?? []

  return mapped.length > 0 ? mapped.slice(0, 9) : getFallbackNavigation(locale)
}

function mapHeroSlide(slide: HeroSlideDoc, locale: Locale): HeroSlide | undefined {
  if (!slide.title) {
    return undefined
  }

  const desktopImage = resolveMedia(slide.desktopImage, locale)

  if (!desktopImage) {
    return undefined
  }

  return {
    contentPosition: slide.contentPosition || 'center',
    desktopImage,
    eyebrow: slide.eyebrow,
    id: slide.id,
    mobileImage: resolveMedia(slide.mobileImage, locale),
    overlayStrength: slide.overlayStrength || 'medium',
    primaryCtaLabel: slide.primaryCtaLabel,
    primaryCtaUrl: slide.primaryCtaUrl,
    secondaryCtaLabel: slide.secondaryCtaLabel,
    secondaryCtaUrl: slide.secondaryCtaUrl,
    subtitle: slide.subtitle,
    textAlignment: slide.textAlignment || 'left',
    textTheme: slide.textTheme || 'light',
    title: slide.title
  }
}

export async function getHeader(locale: Locale): Promise<HeaderData> {
  const fallback: HeaderData = {
    navigationItems: getFallbackNavigation(locale),
    searchPlaceholder:
      locale === 'fr'
        ? 'Rechercher un produit, une marque ou une référence...'
        : 'ابحث عن منتج أو علامة تجارية أو مرجع...',
    showAccount: true,
    showCart: true,
    showWishlist: true,
    stickyHeaderEnabled: true
  }

  return cacheByLocale(
    'header',
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const header = (await payload.findGlobal({
          depth: 1,
          locale,
          slug: 'header'
        })) as HeaderGlobalDoc

        return {
          announcementText: header.announcementText,
          logo: resolveMedia(header.logo, locale),
          navigationItems: mapNavigation(locale, header.navigationItems),
          searchPlaceholder: header.searchPlaceholder || fallback.searchPlaceholder,
          showAccount: header.showAccount ?? true,
          showCart: header.showCart ?? true,
          showWishlist: header.showWishlist ?? true,
          stickyHeaderEnabled: header.stickyHeaderEnabled ?? true
        }
      } catch {
        return fallback
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.header,
      tags: [STOREFRONT_TAGS.header]
    }
  )
}

export async function getHeroSlides(locale: Locale, now = new Date()): Promise<HeroSlide[]> {
  const timeBucket = Math.floor(now.getTime() / (15 * 60 * 1000))

  return cacheByLocale(
    `hero-${timeBucket}`,
    locale,
    async () => {
      try {
        const payload = await getPayloadClient()
        const isoDate = now.toISOString()
        const result = await payload.find({
          collection: 'hero-slides',
          depth: 1,
          draft: false,
          limit: 3,
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
                or: [
                  {
                    startDate: {
                      exists: false
                    }
                  },
                  {
                    startDate: {
                      less_than_equal: isoDate
                    }
                  }
                ]
              },
              {
                or: [
                  {
                    endDate: {
                      exists: false
                    }
                  },
                  {
                    endDate: {
                      greater_than_equal: isoDate
                    }
                  }
                ]
              }
            ]
          }
        })

        return (result.docs as HeroSlideDoc[])
          .map((slide) => mapHeroSlide(slide, locale))
          .filter((slide): slide is HeroSlide => Boolean(slide))
      } catch {
        return []
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.hero,
      tags: [STOREFRONT_TAGS.hero, STOREFRONT_TAGS.homepage]
    }
  )
}

export function getHeroMetadata(slides: HeroSlide[], locale: Locale) {
  const firstSlide = slides[0]

  return {
    description:
      firstSlide?.subtitle ||
      (locale === 'fr'
        ? 'Amous, quincaillerie et outillage pour vos projets.'
        : 'أموس لمستلزمات البناء والإصلاح والمشاريع اليومية.'),
    title: firstSlide?.title || 'Amous'
  }
}
