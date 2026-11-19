/**
 * Where to send the shopper back after an add-to-cart. Only same-site paths are accepted
 * (no "//host" or absolute URLs), and status flags replace any previous ones so repeated
 * adds don't pile up `?cart=added&cart=added…`.
 */
export function resolveCartReturnPath(sourcePath: string, fallback: string): string {
  const candidate = sourcePath.trim()
  return candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.startsWith('/\') ? candidate : fallback
}

export function withCartStatus(path: string, status: { cart?: string; cartError?: string }): string {
  const [pathname, query = ''] = path.split('?', 2)
  const params = new URLSearchParams(query)

  params.delete('cart')
  params.delete('cartError')

  if (status.cart) params.set('cart', status.cart)
  if (status.cartError) params.set('cartError', status.cartError)

  const next = params.toString()
  return next ? `${pathname}?${next}` : pathname
}
