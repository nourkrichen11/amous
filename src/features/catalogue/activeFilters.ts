import type { ResolvedSearchParams } from './searchParams'
import { parseList } from './searchParams'
import type { BrandItem, CategoryItem } from './types'
import { buildCatalogueHref } from './url'

export type ActiveFilter = {
  href: string
  key: string
  label: string
}

const STOCK_LABELS: Record<string, string> = {
  in_stock: 'En stock',
  low_stock: 'Stock limité',
  out_of_stock: 'Rupture de stock'
}

/** Parameters that describe how results are shown, not which results: kept by "Tout effacer". */
const DISPLAY_PARAMS = ['sort', 'limit', 'view'] as const

type ActiveFilterContext = {
  brands: Array<Pick<BrandItem, 'name' | 'slug'>>
  /** Boutique only: top-level category radio (`category` / `subcategory` params). */
  categories?: CategoryItem[]
  params: ResolvedSearchParams
  path: string
  /** Category page only: subcategory filter (`sub` param). */
  subcategories?: Array<{ name: string; slug: string }>
}

function formatPrice(value: string) {
  return `${value.replace('.', ',')} DT`
}

export function getActiveFilters({ brands, categories = [], params, path, subcategories = [] }: ActiveFilterContext): ActiveFilter[] {
  const filters: ActiveFilter[] = []
  const remove = (updates: Record<string, string | null>) => buildCatalogueHref(path, params, updates)

  if (params.q?.trim()) {
    filters.push({ href: remove({ q: null }), key: 'q', label: `« ${params.q.trim()} »` })
  }

  const selectedCategory = categories.find((category) => category.slug === params.category)
  if (selectedCategory) {
    filters.push({ href: remove({ category: null, subcategory: null }), key: 'category', label: selectedCategory.name })
    const selectedSubcategory = selectedCategory.children?.find((category) => category.slug === params.subcategory)
    if (selectedSubcategory) {
      filters.push({ href: remove({ subcategory: null }), key: 'subcategory', label: selectedSubcategory.name })
    }
  }

  const sub = subcategories.find((category) => category.slug === params.sub)
  if (sub) {
    filters.push({ href: remove({ sub: null }), key: 'sub', label: sub.name })
  }

  const brandValues = parseList(params.brand)
  brandValues.forEach((slug) => {
    const brand = brands.find((entry) => entry.slug === slug)
    if (!brand) return
    const next = brandValues.filter((value) => value !== slug).join(',')
    filters.push({ href: remove({ brand: next || null }), key: `brand-${slug}`, label: brand.name })
  })

  const stockValues = parseList(params.stock)
  stockValues.forEach((status) => {
    if (!STOCK_LABELS[status]) return
    const next = stockValues.filter((value) => value !== status).join(',')
    filters.push({ href: remove({ stock: next || null }), key: `stock-${status}`, label: STOCK_LABELS[status] })
  })

  if (params.inStock === '1' && stockValues.length === 0) {
    filters.push({ href: remove({ inStock: null }), key: 'inStock', label: 'Disponible' })
  }

  if (params.minPrice || params.maxPrice) {
    const label =
      params.minPrice && params.maxPrice
        ? `${formatPrice(params.minPrice)} – ${formatPrice(params.maxPrice)}`
        : params.minPrice
          ? `Dès ${formatPrice(params.minPrice)}`
          : `Jusqu’à ${formatPrice(params.maxPrice ?? '')}`
    filters.push({ href: remove({ maxPrice: null, minPrice: null }), key: 'price', label })
  }

  if (params.promotion === '1') filters.push({ href: remove({ promotion: null }), key: 'promotion', label: 'En promotion' })
  if (params.new === '1') filters.push({ href: remove({ new: null }), key: 'new', label: 'Nouveautés' })
  if (params.featured === '1') filters.push({ href: remove({ featured: null }), key: 'featured', label: 'Sélection AMOUS' })

  return filters
}

/** Clears every filter and the search, keeping sort / page size / view. */
export function getClearFiltersHref(path: string, params: ResolvedSearchParams): string {
  const kept = new URLSearchParams()
  DISPLAY_PARAMS.forEach((key) => {
    const value = params[key]
    if (value) kept.set(key, value)
  })

  const query = kept.toString()
  return query ? `${path}?${query}` : path
}
