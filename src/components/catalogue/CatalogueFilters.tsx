'use client'

import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useMemo, useState } from 'react'

import type { BrandItem, CategoryItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

type CatalogueFiltersProps = {
  brands: BrandItem[]
  categories?: CategoryItem[]
  locale: Locale
  params: Record<string, string | undefined>
  path: string
  totalDocs?: number
  variant?: 'desktop' | 'mobile'
}

type FilterPanelProps = Omit<CatalogueFiltersProps, 'totalDocs' | 'variant'> & {
  idPrefix: string
  totalDocs?: number
}

const stockOptions = [
  { label: 'En stock', value: 'in_stock' },
  { label: 'Stock limité', value: 'low_stock' },
  { label: 'Rupture de stock', value: 'out_of_stock' }
] as const

function splitValues(value?: string) {
  return value?.split(',').filter(Boolean) ?? []
}

function FilterSection({ children, label, open = true }: { children: React.ReactNode; label: string; open?: boolean }) {
  return (
    <details className="group border-b border-[var(--color-border)] py-4 last:border-0" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[#17233b] marker:hidden">
        {label}
        <ChevronDown aria-hidden="true" className="transition-transform group-open:rotate-180" size={17} />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  )
}

function CheckRow({ defaultChecked, label, name, value }: { defaultChecked: boolean; label: string; name: string; value: string }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-[#334155]">
      <input
        className="h-4 w-4 rounded border-slate-300 accent-[#1d4ed8]"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
        value={value}
      />
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  )
}

function FilterPanel({ brands, categories = [], idPrefix, params, path, totalDocs }: FilterPanelProps) {
  const [brandSearch, setBrandSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? '')
  const selectedBrands = splitValues(params.brand)
  const selectedStocks = splitValues(params.stock)
  const selectedParent = categories.find((category) => category.slug === selectedCategory)
  const visibleBrands = useMemo(() => {
    const query = brandSearch.trim().toLocaleLowerCase('fr')
    return query ? brands.filter((brand) => brand.name.toLocaleLowerCase('fr').includes(query)) : brands
  }, [brandSearch, brands])

  return (
    <form action={path} className="flex min-h-0 flex-1 flex-col" method="get">
      {['q', 'sort', 'view', 'limit'].map((name) =>
        params[name] ? <input key={name} name={name} type="hidden" value={params[name]} /> : null
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 lg:overflow-visible lg:px-0">
        {categories.length > 0 ? (
          <FilterSection label="Catégorie">
            <div className="grid max-h-56 gap-0.5 overflow-y-auto pe-1">
              <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm">
                <input
                  className="h-4 w-4 accent-[#1d4ed8]"
                  defaultChecked={!params.category}
                  name="category"
                  onChange={() => setSelectedCategory('')}
                  type="radio"
                  value=""
                />
                Toutes les catégories
              </label>
              {categories.map((category) => (
                <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm" key={String(category.id)}>
                  <input
                    className="h-4 w-4 accent-[#1d4ed8]"
                    defaultChecked={params.category === category.slug}
                    name="category"
                    onChange={() => setSelectedCategory(category.slug)}
                    type="radio"
                    value={category.slug}
                  />
                  <span className="min-w-0 flex-1">{category.name}</span>
                  {typeof category.productCount === 'number' ? (
                    <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{category.productCount}</span>
                  ) : null}
                </label>
              ))}
            </div>
          </FilterSection>
        ) : null}

        {selectedParent?.children?.length ? (
          <FilterSection label="Sous-catégorie">
            <div className="grid gap-0.5">
              <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm">
                <input
                  className="h-4 w-4 accent-[#1d4ed8]"
                  defaultChecked={!params.subcategory}
                  name="subcategory"
                  type="radio"
                  value=""
                />
                Toutes
              </label>
              {selectedParent.children.map((child) => (
                <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm" key={String(child.id)}>
                  <input
                    className="h-4 w-4 accent-[#1d4ed8]"
                    defaultChecked={params.subcategory === child.slug}
                    name="subcategory"
                    type="radio"
                    value={child.slug}
                  />
                  {child.name}
                </label>
              ))}
            </div>
          </FilterSection>
        ) : null}

        {brands.length > 0 ? (
          <FilterSection label="Marque">
            <label className="relative block" htmlFor={`${idPrefix}-brand-search`}>
              <span className="sr-only">Rechercher une marque</span>
              <Search aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-white ps-9 pe-3 text-sm outline-none focus:border-[#1d4ed8]"
                id={`${idPrefix}-brand-search`}
                onChange={(event) => setBrandSearch(event.target.value)}
                placeholder="Rechercher une marque"
                type="search"
                value={brandSearch}
              />
            </label>
            <div className="mt-2 grid max-h-40 gap-0.5 overflow-y-auto pe-1">
              {visibleBrands.map((brand) => (
                <CheckRow
                  defaultChecked={selectedBrands.includes(brand.slug)}
                  key={String(brand.id)}
                  label={brand.name}
                  name="brand"
                  value={brand.slug}
                />
              ))}
              {visibleBrands.length === 0 ? <p className="py-2 text-xs text-[var(--color-text-muted)]">Aucune marque trouvée.</p> : null}
            </div>
          </FilterSection>
        ) : null}

        <FilterSection label="Prix">
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-muted)]">
              Min. (DT)
              <input
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] px-2.5 text-sm"
                defaultValue={params.minPrice}
                inputMode="decimal"
                min="0"
                name="minPrice"
                placeholder="0"
                type="number"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-muted)]">
              Max. (DT)
              <input
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] px-2.5 text-sm"
                defaultValue={params.maxPrice}
                inputMode="decimal"
                min="0"
                name="maxPrice"
                placeholder="Max."
                type="number"
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection label="Disponibilité">
          <div className="grid gap-0.5">
            {stockOptions.map((option) => (
              <CheckRow
                defaultChecked={selectedStocks.includes(option.value) || (params.inStock === '1' && option.value !== 'out_of_stock')}
                key={option.value}
                label={option.label}
                name="stock"
                value={option.value}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Offres" open={false}>
          <div className="grid gap-0.5">
            <CheckRow defaultChecked={params.promotion === '1'} label="En promotion" name="promotion" value="1" />
            <CheckRow defaultChecked={params.new === '1'} label="Nouveautés" name="new" value="1" />
            <CheckRow defaultChecked={params.featured === '1'} label="Sélection AMOUS" name="featured" value="1" />
          </div>
        </FilterSection>
      </div>

      <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] bg-white p-4 lg:static lg:mt-2 lg:border-0 lg:p-0">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold text-[#334155] hover:bg-slate-50"
          href={path}
        >
          Réinitialiser
        </Link>
        <button className="min-h-11 rounded-md bg-[#1d4ed8] px-3 text-sm font-bold text-white hover:bg-[#1e40af]" type="submit">
          {typeof totalDocs === 'number' ? `Voir ${totalDocs} produits` : 'Appliquer'}
        </button>
      </div>
    </form>
  )
}

export function CatalogueFilters(props: CatalogueFiltersProps) {
  const [open, setOpen] = useState(false)
  const generatedId = useId().replaceAll(':', '')
  const variant = props.variant ?? 'desktop'

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (variant === 'mobile') {
    return (
      <>
        <button
          aria-controls={`${generatedId}-drawer`}
          aria-expanded={open}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[#17233b]"
          onClick={() => setOpen(true)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={17} />
          Filtres
        </button>
        {open ? (
          <div className="fixed inset-0 z-[80] lg:hidden" id={`${generatedId}-drawer`} role="dialog" aria-label="Filtres des produits" aria-modal="true">
            <button aria-label="Fermer les filtres" className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} type="button" />
            <div className="absolute inset-y-0 start-0 flex w-[min(92vw,380px)] flex-col bg-white shadow-2xl">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
                <div>
                  <p className="font-bold text-[#17233b]">Filtres</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Affinez votre sélection</p>
                </div>
                <button aria-label="Fermer" className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-slate-100" onClick={() => setOpen(false)} type="button">
                  <X aria-hidden="true" size={20} />
                </button>
              </div>
              <FilterPanel {...props} idPrefix={`${generatedId}-mobile`} />
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div className="sticky top-6 rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-subtle)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h2 className="flex items-center gap-2 font-bold text-[#17233b]">
          <SlidersHorizontal aria-hidden="true" size={17} />
          Filtres
        </h2>
        <Link className="text-xs font-semibold text-[#1d4ed8] hover:underline" href={props.path}>Tout effacer</Link>
      </div>
      <FilterPanel {...props} idPrefix={`${generatedId}-desktop`} />
    </div>
  )
}
