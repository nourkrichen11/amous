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
    if (value && key !== 'page') {
      params.set(key, value)
    }
  })
  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function Pagination({ page, pathname, searchParams, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1
        return (
          <Link
            aria-current={nextPage === page ? 'page' : undefined}
            className="inline-flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)] px-3 aria-[current=page]:bg-[var(--color-primary)] aria-[current=page]:text-white"
            href={pageHref(pathname, searchParams, nextPage)}
            key={nextPage}
          >
            {nextPage}
          </Link>
        )
      })}
    </nav>
  )
}
