import type { Locale } from '@/i18n/config'

export type ID = string | number

export type MediaItem = {
  id: ID
  alt?: string
  height?: number
  url?: string
  width?: number
}

export type CategoryItem = {
  id: ID
  name: string
  slug: string
  shortDescription?: string
  longDescription?: unknown
  image?: MediaItem
  displayOrder?: number
  featured?: boolean
  showOnHomepage?: boolean
  productCount?: number
  parent?: {
    id: ID
    name: string
    slug: string
  }
  seo?: {
    metaDescription?: string
    metaTitle?: string
    noIndex?: boolean
  }
  children?: Array<{
    id: ID
    name: string
    slug: string
  }>
}

export type BrandItem = {
  id: ID
  name: string
  slug: string
  logo?: MediaItem
}

export type ProductAttribute = {
  label: string
  value: string
  unit?: string
}

export type ProductItem = {
  id: ID
  name: string
  slug: string
  sku: string
  shortDescription?: string
  fullDescription?: string
  category?: CategoryItem
  brand?: BrandItem
  images: MediaItem[]
  publicPrice: number
  previousPrice?: number
  vatRate: number
  stockQuantity: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  unit: 'piece' | 'box' | 'metre' | 'litre' | 'kilogram' | 'pack'
  minimumOrderQuantity: number
  quantityIncrement: number
  featured?: boolean
  newProduct?: boolean
  promotionalProduct?: boolean
  technicalAttributes: ProductAttribute[]
  seoTitle?: string
  seoDescription?: string
}

export type SiteSettingsData = {
  siteName: string
  phone?: string
  whatsappNumber?: string
  email?: string
  address?: string
  searchPlaceholder?: string
  copyrightText?: string
  defaultSeoTitle?: string
  defaultSeoDescription?: string
}

export type HomepageData = {
  announcementText?: string
  heroTitle: string
  heroSubtitle?: string
  heroCtaLabel?: string
  heroCtaUrl?: string
  featuredCategories: CategoryItem[]
  featuredProducts: ProductItem[]
  featuredBrands: BrandItem[]
  benefits: Array<{ title: string; description?: string }>
}

export type HomepageSectionsData = {
  mainCategories: CategoryItem[]
  bestSellingProducts: ProductItem[]
  currentPromotions: ProductItem[]
  partnerBrands: BrandItem[]
  newProducts: ProductItem[]
}

export type ProductQuery = {
  locale: Locale
  categoryId?: ID
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  promotion?: boolean
  page?: number
  sort?: string
}

export type ProductListing = {
  products: ProductItem[]
  totalDocs: number
  totalPages: number
  page: number
}
