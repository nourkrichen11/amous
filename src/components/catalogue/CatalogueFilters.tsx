'use client'

import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'

import type { BrandItem, CategoryItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type CatalogueFiltersProps = {
  brands: Array<BrandItem & { count?: number }>
  /** Boutique: top-level category radio (`category` / `subcategory` params). */
  categories?: CategoryItem[]
  /** Category page: subcategories of the current category (`sub` param). */
  subcategories?: Array<{ id: string | number; name: string; slug: string }>
  clearHref?: string
  locale: Locale
  params: Record<string, string | undefined>
  path: string
  /** Price span of the current scope, in millimes — used as input hints. */
  priceBounds?: { max: number; min: number }
  showOffers?: boolean
  /** When provided, statuses with no products are hidden. */
  stockCounts?: Record<StockStatus, number>
  totalDocs?: number
  variant?: 'desktop' | 'mobile'
}

type FilterPanelProps = Omit<CatalogueFiltersProps, 'variant'> & {
  autoApply: boolean
  idPrefix: string
}

const stockOptions: Array<{ label: string; value: StockStatus }> = [
  { label: 'En stock', value: 'in_stock' },
  { label: 'Stock limité', value: 'low_stock' },
  { label: 'Rupture de stock', value: 'out_of_stock' }
]

// Params the filter form owns; everything else (q, sort, view, limit…) is carried over.
const FILTER_PARAMS = new Set(['brand', 'stock', 'inStock', 'minPrice', 'maxPrice', 'sub', 'category', 'subcategory', 'promotion', 'new', 'featured', 'page'])

function splitValues(value?: string) {
  return value?.split(',').filter(Boolean) ?? []
}

function toDinars(millimes: number) {
  return new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 3 }).format(millimes / 1000)
}

function FilterSection({ children, label, open = true }: { children: ReactNode; label: string; open?: boolean }) {
  return (
    <details className="group border-b border-[var(--color-border)] py-3.5 last:border-0" open={open}>
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[var(--color-navy)] [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-180" size={16} />
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  )
}

function OptionRow({ count, defaultChecked, label, name, type = 'checkbox', value }: { count?: number; defaultChecked: boolean; label: string; name: string; type?: 'checkbox' | 'radio'; value: string }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-1 text-sm text-slate-700 hover:bg-slate-50">
      <input className="h-4 w-4 shrink-0 accent-[var(--color-navy)]" defaultChecked={defaultChecked} name={name} type={type} value={value} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' ? <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{count}</span> : null}
    </label>
  )
}

function FilterPanel({ autoApply, brands, categories = [], clearHref, idPrefix, params, path, priceBounds, showOffers = true, stockCounts, subcategories = [] }: FilterPanelProps) {
  const [brandSearch, setBrandSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? '')
  const selectedBrands = splitValues(params.brand)
  const selectedStocks = splitValues(params.stock)
  const selectedParent = categories.find((category) => category.slug === selectedCategory)
  const visibleStockOptions = stockCounts ? stockOptions.filter((option) => stockCounts[option.value] > 0 || selectedStocks.includes(option.value)) : stockOptions
  const visibleBrands = useMemo(() => {
    const query = brandSearch.trim().toLocaleLowerCase('fr')
    return query ? brands.filter((brand) => brand.name.toLocaleLowerCase('fr').includes(query)) : brands
  }, [brandSearch, brands])

  // Checkbox / radio changes apply immediately on desktop; price fields use the button.
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (autoApply && (target.type === 'checkbox' || target.type === 'radio')) {
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <form action={path} className="flex min-h-0 flex-1 flex-col" method="get" onChange={handleChange}>
      {Object.entries(params).map(([name, value]) => (value && !FILTER_PARAMS.has(name) ? <input key={name} name={name} type="hidden" value={value} /> : null))}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 lg:overflow-visible lg:px-0">
        {categories.length > 0 ? (
          <FilterSection label="Catégorie">
            <div className="grid max-h-56 gap-0.5 overflow-y-auto pe-1">
              <label className="flex min-h-9 cursor-pointer items-center gap-2.5 px-1 text-sm">
                <input className="h-4 w-4 accent-[var(--color-navy)]" defaultChecked={!params.category} name="category" onChange={() => setSelectedCategory('')} type="radio" value="" />
                Toutes les catégories
              </label>
              {categories.map((category) => (
                <label className="flex min-h-9 cursor-pointer items-center gap-2.5 px-1 text-sm" key={String(category.id)}>
                  <input
                    className="h-4 w-4 accent-[var(--color-navy)]"
                    defaultChecked={params.category === category.slug}
                    name="category"
                    onChange={() => setSelectedCategory(category.slug)}
                    type="radio"
                    value={category.slug}
                  />
                  <span className="min-w-0 flex-1">{category.name}</span>
                  {typeof category.productCount === 'number' ? <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{category.productCount}</span> : null}
                </label>
              ))}
            </div>
          </FilterSection>
        ) : null}

        {selectedParent?.children?.length ? (
          <FilterSection label="Sous-catégorie">
            <div className="grid gap-0.5">
              <OptionRow defaultChecked={!params.subcategory} label="Toutes" name="subcategory" type="radio" value="" />
              {selectedParent.children.map((child) => (
                <OptionRow defaultChecked={params.subcategory === child.slug} key={String(child.id)} label={child.name} name="subcategory" type="radio" value={child.slug} />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {subcategories.length > 0 ? (
          <FilterSection label="Sous-catégories">
            <div className="grid gap-0.5">
              <OptionRow defaultChecked={!params.sub} label="Toutes" name="sub" type="radio" value="" />
              {subcategories.map((child) => (
                <OptionRow defaultChecked={params.sub === child.slug} key={String(child.id)} label={child.name} name="sub" type="radio" value={child.slug} />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {brands.length > 0 ? (
          <FilterSection label="Marque">
            {brands.length > 6 ? (
              <label className="relative mb-2 block" htmlFor={`${idPrefix}-brand-search`}>
                <span className="sr-only">Rechercher une marque</span>
                <Search aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white ps-9 pe-3 text-sm outline-none focus:border-[var(--color-navy)]"
                  id={`${idPrefix}-brand-search`}
                  onChange={(event) => setBrandSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault()
                  }}
                  placeholder="Rechercher une marque"
                  type="search"
                  value={brandSearch}
                />
              </label>
            ) : null}
            <div className="grid max-h-52 gap-0.5 overflow-y-auto pe-1">
              {/* Selected brands stay in the form even when hidden by the brand search. */}
              {brands
                .filter((brand) => selectedBrands.includes(brand.slug) && !visibleBrands.includes(brand))
                .map((brand) => (
                  <input key={`hidden-${brand.slug}`} name="brand" type="hidden" value={brand.slug} />
                ))}
              {visibleBrands.map((brand) => (
                <OptionRow count={brand.count} defaultChecked={selectedBrands.includes(brand.slug)} key={String(brand.id)} label={brand.name} name="brand" value={brand.slug} />
              ))}
              {visibleBrands.length === 0 ? <p className="py-2 text-xs text-[var(--color-text-muted)]">Aucune marque trouvée.</p> : null}
            </div>
          </FilterSection>
        ) : null}

        <FilterSection label="Prix (DT)">
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-muted)]">
              Min.
              <input
                className="h-10 min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-navy)]"
                defaultValue={params.minPrice}
                inputMode="decimal"
                min="0"
                name="minPrice"
                placeholder={priceBounds ? toDinars(priceBounds.min) : '0'}
                step="0.001"
                type="number"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-muted)]">
              Max.
              <input
                className="h-10 min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-navy)]"
                defaultValue={params.maxPrice}
                inputMode="decimal"
                min="0"
                name="maxPrice"
                placeholder={priceBounds ? toDinars(priceBounds.max) : 'Max.'}
                step="0.001"
                type="number"
              />
            </label>
          </div>
          {autoApply ? (
            <button className="mt-2 min-h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-navy)] text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-navy-soft)]" type="submit">
              Appliquer le prix
            </button>
          ) : null}
        </FilterSection>

        {visibleStockOptions.length > 0 ? (
          <FilterSection label="Disponibilité">
            <div className="grid gap-0.5">
              {visibleStockOptions.map((option) => (
                <OptionRow
                  count={stockCounts?.[option.value]}
                  defaultChecked={selectedStocks.includes(option.value) || (params.inStock === '1' && option.value !== 'out_of_stock')}
                  key={option.value}
                  label={option.label}
                  name="stock"
                  value={option.value}
                />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {showOffers ? (
          <FilterSection label="Offres" open={params.promotion === '1' || params.new === '1' || params.featured === '1'}>
            <div className="grid gap-0.5">
              <OptionRow defaultChecked={params.promotion === '1'} label="En promotion" name="promotion" value="1" />
              <OptionRow defaultChecked={params.new === '1'} label="Nouveautés" name="new" value="1" />
              <OptionRow defaultChecked={params.featured === '1'} label="Sélection AMOUS" name="featured" value="1" />
            </div>
          </FilterSection>
        ) : null}
      </div>

      {!autoApply ? (
        <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] bg-white p-4">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={clearHref ?? path}
          >
            Tout effacer
          </Link>
          <button className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-navy)] px-3 text-sm font-bold text-white hover:bg-[var(--color-navy-strong)]" type="submit">
            Appliquer
          </button>
        </div>
      ) : null}
    </form>
  )
}

function countActive(params: Record<string, string | undefined>) {
  return (
    splitValues(params.brand).length +
    splitValues(params.stock).length +
    (params.minPrice || params.maxPrice ? 1 : 0) +
    (params.sub || params.category ? 1 : 0) +
    ['promotion', 'new', 'featured', 'inStock'].filter((key) => params[key] === '1').length
  )
}

export function CatalogueFilters(props: CatalogueFiltersProps) {
  const [open, setOpen] = useState(false)
  const generatedId = useId().replaceAll(':', '')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const variant = props.variant ?? 'desktop'
  const activeCount = countActive(props.params)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      // Keep keyboard focus inside the drawer while it is open.
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button, input, select, summary, [tabindex]:not([tabindex="-1"])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      trigger?.focus()
    }
  }, [open])

  if (variant === 'mobile') {
    return (
      <>
        <button
          aria-controls={`${generatedId}-drawer`}
          aria-expanded={open}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-navy)]"
          onClick={() => setOpen(true)}
          ref={triggerRef}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={17} />
          Filtres
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[11px] font-bold text-white">
              {activeCount}
              <span className="sr-only"> filtre(s) actif(s)</span>
            </span>
          ) : null}
        </button>
        {open ? (
          <div aria-labelledby={`${generatedId}-title`} aria-modal="true" className="fixed inset-0 z-[80] lg:hidden" id={`${generatedId}-drawer`} role="dialog">
            <button aria-label="Fermer les filtres" className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} tabIndex={-1} type="button" />
            <div className="absolute inset-y-0 start-0 flex w-[min(92vw,380px)] flex-col bg-white shadow-2xl" ref={panelRef}>
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
                <div>
                  <p className="font-bold text-[var(--color-navy)]" id={`${generatedId}-title`}>
                    Filtres
                  </p>
                  {typeof props.totalDocs === 'number' ? (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {props.totalDocs} {props.totalDocs > 1 ? 'produits' : 'produit'} actuellement
                    </p>
                  ) : null}
                </div>
                <button aria-label="Fermer" className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-slate-100" onClick={() => setOpen(false)} ref={closeRef} type="button">
                  <X aria-hidden="true" size={20} />
                </button>
              </div>
              <FilterPanel {...props} autoApply={false} idPrefix={`${generatedId}-mobile`} />
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-4 pb-2 pt-3 shadow-[var(--shadow-subtle)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-navy)]">
          <SlidersHorizontal aria-hidden="true" size={16} />
          Filtres
        </h2>
        {activeCount > 0 || props.params.q ? (
          <Link className="text-xs font-semibold text-[var(--color-primary)] hover:underline" href={props.clearHref ?? props.path}>
            Tout effacer
          </Link>
        ) : null}
      </div>
      <FilterPanel {...props} autoApply idPrefix={`${generatedId}-desktop`} />
    </div>
  )
}
