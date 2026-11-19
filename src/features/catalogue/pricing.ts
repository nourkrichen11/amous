import type { ProductItem } from './types'

/** Whole-number discount percentage between previousPrice and publicPrice (both in millimes). */
export function getDiscountPercent(product: Pick<ProductItem, 'previousPrice' | 'publicPrice'>): number {
  if (typeof product.previousPrice !== 'number' || product.previousPrice <= 0 || product.previousPrice <= product.publicPrice) {
    return 0
  }

  return Math.round(((product.previousPrice - product.publicPrice) / product.previousPrice) * 100)
}
