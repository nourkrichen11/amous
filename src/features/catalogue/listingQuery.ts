import type { Locale } from '@/i18n/config'

import { parseList, parseMillimePrice, parsePage, type ResolvedSearchParams } from './searchParams'
import type { ID, ProductItem, ProductQuery } from './types'

export const PAGE_SIZE_OPTIONS = [12, 24, 32, 48] as const

export const CATEGORY_SORT_OPTIONS = [
  { label: 'Plus récents', value: 'new' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Nom (A–Z)', value: 'name' }
] as const

export const CATEGORY_DEFAULT_SORT = 'new'
export const CATEGORY_DEFAULT_PAGE_SIZE = 24

const STOCK_STATUSES: ProductItem['stockStatus'][] = ['in_stock', 'low_stock', 'out_of_stock']

export function parseListingPageSize(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed) ? parsed : fallback
}

export function parseListingSort(value: string | undefined, allowed: readonly string[], fallback: string): string {
  return value && allowed.includes(value) ? value : fallback
}

/** Normalizes min/max (in DT) to millimes, swapping them when entered in the wrong order. */
export function parsePriceRange(params: ResolvedSearchParams): { maxPrice?: number; minPrice?: number } {
  let minPrice = parseMillimePrice(params.minPrice)
  let maxPrice = parseMillimePrice(params.maxPrice)

  if (typeof minPrice === 'number' && typeof maxPrice === 'number' && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  return { maxPrice, minPrice }
}

type ListingQueryOptions = {
  categoryIds?: ID[]
  defaultPageSize: number
  defaultSort?: string
  locale: Locale
  searchScope?: ProductQuery['searchScope']
  sortOptions?: readonly string[]
}

/** Translates URL query parameters into the backend product query used by catalogue pages. */
export function buildListingQuery(params: ResolvedSearchParams, options: ListingQueryOptions): ProductQuery {
  const stockStatuses = parseList(params.stock).filter((value): value is ProductItem['stockStatus'] =>
    STOCK_STATUSES.includes(value as ProductItem['stockStatus'])
  )
  const sort = options.sortOptions ? parseListingSort(params.sort, options.sortOptions, options.defaultSort ?? options.sortOptions[0]) : params.sort

  return {
    brandSlugs: parseList(params.brand),
    categoryIds: options.categoryIds,
    featured: params.featured === '1',
    inStock: params.inStock === '1',
    locale: options.locale,
    newProduct: params.new === '1',
    page: parsePage(params.page),
    pageSize: parseListingPageSize(params.limit, options.defaultPageSize),
    promotion: params.promotion === '1',
    search: params.q?.trim() || undefined,
    searchScope: options.searchScope,
    sort,
    stockStatuses,
    ...parsePriceRange(params)
  }
}

/** "1–24 sur 57 produits" */
export function formatResultRange(page: number, pageSize: number, totalDocs: number): string {
  if (totalDocs === 0) {
    return '0 produit'
  }

  const from = Math.min((page - 1) * pageSize + 1, totalDocs)
  const to = Math.min(page * pageSize, totalDocs)
  const formatter = new Intl.NumberFormat('fr-TN')
  const noun = totalDocs > 1 ? 'produits' : 'produit'

  return `${formatter.format(from)}–${formatter.format(to)} sur ${formatter.format(totalDocs)} ${noun}`
}
