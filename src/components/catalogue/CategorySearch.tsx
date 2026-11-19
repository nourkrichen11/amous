'use client'

import { Loader2, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { buildCatalogueHref, preservedParams } from '@/features/catalogue/url'

type CategorySearchProps = {
  categoryName: string
  params: Record<string, string | undefined>
  path: string
}

const DEBOUNCE_MS = 400

/**
 * Search scoped to the current category (the page applies the category constraint).
 * Works as a plain GET form without JavaScript; with JavaScript it updates the URL after a
 * short pause, keeping active filters and resetting pagination. Remount it with
 * `key={params.q}` so external changes (e.g. removing the search chip) reset the field.
 */
export function CategorySearch({ categoryName, params, path }: CategorySearchProps) {
  const router = useRouter()
  const [value, setValue] = useState(params.q ?? '')
  const [isPending, startTransition] = useTransition()
  const timer = useRef<number | undefined>(undefined)
  const current = (params.q ?? '').trim()

  const navigate = (next: string) => {
    window.clearTimeout(timer.current)
    const trimmed = next.trim()
    if (trimmed === current) return
    startTransition(() => {
      router.replace(buildCatalogueHref(path, params, { q: trimmed || null }), { scroll: false })
    })
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <form
      action={path}
      className="relative"
      method="get"
      onSubmit={(event) => {
        event.preventDefault()
        navigate(value)
      }}
      role="search"
    >
      {preservedParams(params, ['q', 'page']).map(([key, paramValue]) => (
        <input key={key} name={key} type="hidden" value={paramValue} />
      ))}
      <label className="sr-only" htmlFor="category-search">
        Rechercher dans la catégorie {categoryName}
      </label>
      <Search aria-hidden="true" className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        autoComplete="off"
        className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white ps-11 pe-20 text-sm text-[var(--color-text)] shadow-[var(--shadow-subtle)] outline-none placeholder:text-slate-400 focus:border-[var(--color-navy)] [&::-webkit-search-cancel-button]:hidden"
        enterKeyHint="search"
        id="category-search"
        maxLength={80}
        name="q"
        onChange={(event) => {
          const next = event.target.value
          setValue(next)
          window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => navigate(next), DEBOUNCE_MS)
        }}
        placeholder="Rechercher un produit ou une référence..."
        type="search"
        value={value}
      />
      <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {isPending ? <Loader2 aria-hidden="true" className="animate-spin text-slate-400" size={16} /> : null}
        {value ? (
          <button
            aria-label="Effacer la recherche"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-slate-500 hover:bg-slate-100"
            onClick={() => {
              setValue('')
              navigate('')
            }}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        ) : null}
      </div>
      <span aria-live="polite" className="sr-only">
        {isPending ? 'Recherche en cours…' : ''}
      </span>
    </form>
  )
}
