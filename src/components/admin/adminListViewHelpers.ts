import type { ListViewServerProps } from 'payload'

/** Shared URL/query helpers for custom Payload list views (Orders/Returns/Products/Users) — kept in one place instead of copy-pasted per view. */

export function queryValue(searchParams: ListViewServerProps['searchParams'], key: string) {
  const value = searchParams?.[key]

  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}

export function queryValues(searchParams: ListViewServerProps['searchParams'], key: string) {
  const value = searchParams?.[key]

  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  return value ? [value] : []
}

export function compactQuery(searchParams: ListViewServerProps['searchParams']) {
  if (!searchParams) {
    return {}
  }

  const entries = Object.entries(searchParams).filter(([key]) => key !== 'page' && key !== 'limit')
  return Object.fromEntries(entries)
}

export function buildFilterHref({
  basePath,
  omit,
  searchParams
}: {
  basePath: string
  omit: string[]
  searchParams: ListViewServerProps['searchParams']
}) {
  const params = new URLSearchParams()

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === 'page' || omit.includes(key)) {
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

    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()

  return query ? `${basePath}?${query}` : basePath
}

export function sortDirection(sort: string, field: string) {
  if (sort === field) {
    return 'ascending' as const
  }

  if (sort === `-${field}`) {
    return 'descending' as const
  }

  return undefined
}
