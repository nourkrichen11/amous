'use client'

import { Grid2X2, List, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import type { BrandItem, CategoryItem } from '@/features/catalogue/types'
import { buildCatalogueHref, preservedParams } from '@/features/catalogue/url'
import type { Locale } from '@/i18n/config'

type CatalogueToolbarProps = {
  brands: BrandItem[]
  categories: CategoryItem[]
  locale: Locale
  params: Record<string, string | undefined>
  path: string
  totalDocs: number
}

type ActiveFilter = {
  href: string
  key: string
  label: string
}

const stockLabels: Record<string, string> = {
  in_stock: 'En stock',
  low_stock: 'Stock limité',
  out_of_stock: 'Rupture de stock'
}

function splitValues(value?: string) {
  return value?.split(',').filter(Boolean) ?? []
}

function activeFilters({ brands, categories, params, path }: Omit<CatalogueToolbarProps, 'locale' | 'totalDocs'>): ActiveFilter[] {
  const filters: ActiveFilter[] = []
  const selectedCategory = categories.find((category) => category.slug === params.category)
  const selectedSubcategory = selectedCategory?.children?.find((category) => category.slug === params.subcategory)

  if (params.q) {
    filters.push({ href: buildCatalogueHref(path, params, { q: null }), key: 'q', label: `“${params.q}”` })
  }
  if (selectedCategory) {
    filters.push({ href: buildCatalogueHref(path, params, { category: null, subcategory: null }), key: 'category', label: selectedCategory.name })
  }
  if (selectedSubcategory) {
    filters.push({ href: buildCatalogueHref(path, params, { subcategory: null }), key: 'subcategory', label: selectedSubcategory.name })
  }

  const brandValues = splitValues(params.brand)
  brandValues.forEach((slug) => {
    const brand = brands.find((entry) => entry.slug === slug)
    if (!brand) return
    const next = brandValues.filter((value) => value !== slug).join(',')
    filters.push({ href: buildCatalogueHref(path, params, { brand: next || null }), key: `brand-${slug}`, label: brand.name })
  })

  const stockValues = splitValues(params.stock)
  stockValues.forEach((status) => {
    const next = stockValues.filter((value) => value !== status).join(',')
    filters.push({ href: buildCatalogueHref(path, params, { stock: next || null }), key: `stock-${status}`, label: stockLabels[status] ?? status })
  })

  if (params.minPrice || params.maxPrice) {
    const label = params.minPrice && params.maxPrice ? `${params.minPrice}–${params.maxPrice} DT` : params.minPrice ? `Dès ${params.minPrice} DT` : `Jusqu’à ${params.maxPrice} DT`
    filters.push({ href: buildCatalogueHref(path, params, { maxPrice: null, minPrice: null }), key: 'price', label })
  }
  if (params.promotion === '1') filters.push({ href: buildCatalogueHref(path, params, { promotion: null }), key: 'promotion', label: 'En promotion' })
  if (params.new === '1') filters.push({ href: buildCatalogueHref(path, params, { new: null }), key: 'new', label: 'Nouveautés' })
  if (params.featured === '1') filters.push({ href: buildCatalogueHref(path, params, { featured: null }), key: 'featured', label: 'Sélection AMOUS' })

  return filters
}

function SubmitSelect({ id, label, name, options, params, path, value }: { id: string; label: string; name: string; options: Array<{ label: string; value: string }>; params: Record<string, string | undefined>; path: string; value: string }) {
  return (
    <form action={path} className="relative min-w-0" method="get">
      {preservedParams(params, [name, 'page']).map(([key, currentValue]) => (
        <input key={key} name={key} type="hidden" value={currentValue} />
      ))}
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select
        className="h-11 w-full appearance-none rounded-md border border-[var(--color-border)] bg-white ps-3 pe-9 text-sm font-semibold text-[#334155]"
        id={id}
        name={name}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        value={value}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
    </form>
  )
}

const sortOptions = [
  { label: 'Pertinence', value: 'relevance' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Nouveautés', value: 'new' },
  { label: 'Promotions', value: 'promotions' }
]

export function CatalogueToolbar(props: CatalogueToolbarProps) {
  const { params, path, totalDocs } = props
  const filters = activeFilters(props)
  const view = params.view === 'list' ? 'list' : 'grid'

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center gap-2 lg:hidden">
        <CatalogueFilters {...props} variant="mobile" />
        <div className="min-w-0 flex-1">
          <SubmitSelect id="catalogue-sort-mobile" label="Trier les produits" name="sort" options={sortOptions} params={params} path={path} value={params.sort ?? 'relevance'} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 shadow-[var(--shadow-subtle)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          <strong className="text-base text-[#17233b]">{new Intl.NumberFormat('fr-TN').format(totalDocs)}</strong>{' '}
          {totalDocs > 1 ? 'produits' : 'produit'}
        </p>

        <div className="hidden items-center gap-2 lg:flex">
          <SubmitSelect id="catalogue-sort-desktop" label="Trier les produits" name="sort" options={sortOptions} params={params} path={path} value={params.sort ?? 'relevance'} />
          <SubmitSelect
            id="catalogue-limit-desktop"
            label="Produits par page"
            name="limit"
            options={[12, 24, 48].map((limit) => ({ label: `${limit} / page`, value: String(limit) }))}
            params={params}
            path={path}
            value={params.limit ?? '12'}
          />
          <div className="ms-1 flex rounded-md border border-[var(--color-border)] bg-white p-1" aria-label="Affichage des produits">
            <Link
              aria-label="Affichage en grille"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${view === 'grid' ? 'bg-[#17233b] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              href={buildCatalogueHref(path, params, { view: null })}
            >
              <Grid2X2 aria-hidden="true" size={16} />
            </Link>
            <Link
              aria-label="Affichage en liste"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${view === 'list' ? 'bg-[#17233b] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              href={buildCatalogueHref(path, params, { view: 'list' })}
            >
              <List aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </div>

      {filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          <span className="text-xs font-bold uppercase text-[var(--color-text-muted)]">Filtres actifs</span>
          {filters.map((filter) => (
            <Link className="inline-flex min-h-8 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-[#1d4ed8] hover:bg-blue-100" href={filter.href} key={filter.key}>
              {filter.label}<span aria-hidden="true">×</span>
            </Link>
          ))}
          <Link className="min-h-8 px-2 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[#17233b] hover:underline" href={path}>Tout effacer</Link>
        </div>
      ) : null}
    </div>
  )
}
