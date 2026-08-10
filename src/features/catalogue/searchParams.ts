export type ResolvedSearchParams = Record<string, string | undefined>

export function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>): ResolvedSearchParams {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  )
}

export function parseMillimePrice(value?: string): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined
  }

  return Math.round(parsed * 1000)
}

export function parsePage(value?: string): number {
  if (!value) {
    return 1
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}
