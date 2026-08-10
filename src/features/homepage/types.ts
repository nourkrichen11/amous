import type { Locale } from '@/i18n/config'
import type { ID, MediaItem } from '@/features/catalogue/types'

export type HeaderNavItem = {
  id: string
  isCategoryTrigger?: boolean
  label: string
  url: string
}

export type HeaderData = {
  announcementText?: string
  logo?: MediaItem
  navigationItems: HeaderNavItem[]
  searchPlaceholder: string
  showAccount: boolean
  showCart: boolean
  showWishlist: boolean
  stickyHeaderEnabled: boolean
}

export type HeroSlide = {
  id: ID
  eyebrow?: string
  title: string
  subtitle?: string
  desktopImage: MediaItem
  mobileImage?: MediaItem
  primaryCtaLabel?: string
  primaryCtaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  textAlignment: 'left' | 'center' | 'right'
  contentPosition: 'start' | 'center' | 'end'
  textTheme: 'light' | 'dark'
  overlayStrength: 'none' | 'low' | 'medium' | 'high'
}

export type HomepageViewData = {
  header: HeaderData
  heroSlides: HeroSlide[]
  locale: Locale
}
