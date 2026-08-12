import Link from 'next/link'

type AdminPaginationProps = {
  basePath: string
  currentPage: number
  limit: number
  query?: Record<string, string | string[] | undefined>
  totalDocs: number
  totalPages: number
}

function buildQueryString(
  page: number,
  limit: number,
  query: Record<string, string | string[] | undefined> = {}
) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) {
          params.append(key, entry)
        }
      })
      return
    }

    params.set(key, value)
  })

  params.set('page', String(page))
  params.set('limit', String(limit))

  return params.toString()
}

function pageWindow(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])

  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
}

export function AdminPagination({ basePath, currentPage, limit, query, totalDocs, totalPages }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const from = totalDocs === 0 ? 0 : (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalDocs)
  const pages = pageWindow(currentPage, totalPages)

  return (
    <footer className="amous-pagination">
      <p className="amous-pagination__summary">
        {from}-{to} sur {totalDocs}
      </p>
      <div className="amous-pagination__controls">
        <Link
          aria-disabled={currentPage <= 1}
          className={`amous-pagination__button${currentPage <= 1 ? ' is-disabled' : ''}`}
          href={`${basePath}?${buildQueryString(Math.max(1, currentPage - 1), limit, query)}`}
          prefetch={false}
        >
          {'<'}
        </Link>
        {pages.map((page, index) => {
          const previousPage = pages[index - 1]
          const showGap = previousPage && page - previousPage > 1

          return (
            <span className="amous-pagination__group" key={page}>
              {showGap ? <span className="amous-pagination__gap">...</span> : null}
              <Link
                aria-current={page === currentPage ? 'page' : undefined}
                className={`amous-pagination__button${page === currentPage ? ' is-active' : ''}`}
                href={`${basePath}?${buildQueryString(page, limit, query)}`}
                prefetch={false}
              >
                {page}
              </Link>
            </span>
          )
        })}
        <Link
          aria-disabled={currentPage >= totalPages}
          className={`amous-pagination__button${currentPage >= totalPages ? ' is-disabled' : ''}`}
          href={`${basePath}?${buildQueryString(Math.min(totalPages, currentPage + 1), limit, query)}`}
          prefetch={false}
        >
          {'>'}
        </Link>
      </div>
    </footer>
  )
}
