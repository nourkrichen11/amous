'use client'

import { ChevronDown, Grid2X2, List, X } from 'lucide-react'
import Link from 'next/link'

import { CatalogueFilters, type CatalogueFiltersProps } from '@/components/catalogue/CatalogueFilters'
import type { ActiveFilter } from '@/features/catalogue/activeFilters'
import { PAGE_SIZE_OPTIONS, formatResultRange } from '@/features/catalogue/listingQuery'
import { buildCatalogueHref, preservedParams } from '@/features/catalogue/url'

type SortOption = { label: string; value: string }

type CatalogueToolbarProps = {
  activeFilters: ActiveFilter[]
  clearHref: string
  defaultPageSize: number
  defaultSort: string
  /** Props for the mobile filter drawer (same data as the desktop sidebar). */
  filterProps: Omit<CatalogueFiltersProps, 'variant'>
  page: number
  pageSize: number
  params: Record<string, string | undefined>
  path: string
  sortOptions: readonly SortOption[]
  totalDocs: number
}

const viewButton = 'inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors'

function SubmitSelect({ id, label, name, options, params, path, value }: { id: string; label: string; name: string; options: readonly SortOption[]; params: Record<string, string | undefined>; path: string; value: string }) {
  return (
    <form action={path} className="relative min-w-0" method="get">
      {preservedParams(params, [name, 'page']).map(([key, currentValue]) => (
        <input key={key} name={key} type="hidden" value={currentValue} />
      ))}
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white ps-3 pe-9 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-[var(--color-navy)]"
        id={id}
        name={name}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
      <noscript>
        <button className="sr-only" type="submit">
          Appliquer
        </button>
      </noscript>
    </form>
  )
}

export function CatalogueToolbar({ activeFilters, clearHref, defaultPageSize, defaultSort, filterProps, page, pageSize, params, path, sortOptions, totalDocs }: CatalogueToolbarProps) {
  const view = params.view === 'list' ? 'list' : 'grid'
  const sortValue = sortOptions.some((option) => option.value === params.sort) ? (params.sort as string) : defaultSort
  const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({ label: `${size} par page`, value: String(size) }))

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <p aria-live="polite" className="text-sm text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-navy)]">{formatResultRange(page, pageSize, totalDocs)}</span>
        </p>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="lg:hidden">
            <CatalogueFilters {...filterProps} variant="mobile" />
          </div>
          <div className="min-w-[10.5rem] flex-1 sm:flex-none">
            <SubmitSelect id="catalogue-sort" label="Trier par" name="sort" options={sortOptions} params={params} path={path} value={sortValue} />
          </div>
          <div className="hidden w-[9.5rem] sm:block">
            <SubmitSelect id="catalogue-limit" label="Produits par page" name="limit" options={pageSizeOptions} params={params} path={path} value={String(pageSize || defaultPageSize)} />
          </div>
          <div aria-label="Affichage des produits" className="hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-0.5 sm:flex" role="group">
            <Link
              aria-current={view === 'grid' ? 'true' : undefined}
              aria-label="Affichage en grille"
              className={`${viewButton} ${view === 'grid' ? 'bg-[var(--color-navy)] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              href={buildCatalogueHref(path, params, { page: params.page, view: null })}
            >
              <Grid2X2 aria-hidden="true" size={16} />
            </Link>
            <Link
              aria-current={view === 'list' ? 'true' : undefined}
              aria-label="Affichage en liste"
              className={`${viewButton} ${view === 'list' ? 'bg-[var(--color-navy)] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              href={buildCatalogueHref(path, params, { page: params.page, view: 'list' })}
            >
              <List aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div aria-label="Filtres actifs" className="flex flex-wrap items-center gap-1.5" role="group">
          {activeFilters.map((filter) => (
            <Link
              aria-label={`Retirer le filtre ${filter.label}`}
              className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-[var(--color-navy)]/15 bg-[var(--color-navy-soft)] ps-3 pe-2 text-xs font-semibold text-[var(--color-navy)] transition-colors hover:border-[var(--color-navy)]/40"
              href={filter.href}
              key={filter.key}
            >
              <span className="truncate">{filter.label}</span>
              <X aria-hidden="true" className="shrink-0 opacity-70" size={13} />
            </Link>
          ))}
          <Link className="inline-flex min-h-8 items-center px-2 text-xs font-semibold text-[var(--color-primary)] hover:underline" href={clearHref}>
            Tout effacer
          </Link>
        </div>
      ) : null}
    </div>
  )
}
