import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type PaginationProps = {
  page: number
  pathname: string
  searchParams: Record<string, string | undefined>
  totalPages: number
}

function pageHref(pathname: string, searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== 'page') params.set(key, value)
  })
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

function visiblePages(page: number, totalPages: number): Array<number | 'ellipsis-start' | 'ellipsis-end'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const pages: Array<number | 'ellipsis-start' | 'ellipsis-end'> = [1]
  if (page > 4) pages.push('ellipsis-start')
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  for (let current = start; current <= end; current += 1) pages.push(current)
  if (page < totalPages - 3) pages.push('ellipsis-end')
  pages.push(totalPages)
  return pages
}

export function Pagination({ page, pathname, searchParams, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const controlClass = 'inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-3 text-sm font-semibold hover:border-[#1d4ed8] hover:text-[#1d4ed8]'

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link aria-label="Page précédente" className={controlClass} href={pageHref(pathname, searchParams, page - 1)}>
          <ChevronLeft aria-hidden="true" size={17} />
        </Link>
      ) : null}
      {visiblePages(page, totalPages).map((entry) =>
        typeof entry === 'number' ? (
          <Link
            aria-current={entry === page ? 'page' : undefined}
            className={`${controlClass} aria-[current=page]:border-[#1d4ed8] aria-[current=page]:bg-[#1d4ed8] aria-[current=page]:text-white`}
            href={pageHref(pathname, searchParams, entry)}
            key={entry}
          >
            {entry}
          </Link>
        ) : <span aria-hidden="true" className="px-1 text-slate-400" key={entry}>…</span>
      )}
      {page < totalPages ? (
        <Link aria-label="Page suivante" className={controlClass} href={pageHref(pathname, searchParams, page + 1)}>
          <ChevronRight aria-hidden="true" size={17} />
        </Link>
      ) : null}
    </nav>
  )
}
