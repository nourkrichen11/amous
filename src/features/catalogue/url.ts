import type { ResolvedSearchParams } from './searchParams'

export function buildCatalogueHref(
  pathname: string,
  current: ResolvedSearchParams,
  updates: Record<string, string | null | undefined>
): string {
  const params = new URLSearchParams()

  Object.entries(current).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  })

  if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
    params.delete('page')
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function preservedParams(
  params: ResolvedSearchParams,
  excluded: string[]
): Array<[string, string]> {
  const ignored = new Set(excluded)
  return Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]) && !ignored.has(entry[0]))
}
