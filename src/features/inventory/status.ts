export function getAvailableStock(product: { reservedStock?: number; stockQuantity?: number }) {
  return Math.max(0, (product.stockQuantity ?? 0) - (product.reservedStock ?? 0))
}

export function getStockStatus(product: { lowStockThreshold?: number; reservedStock?: number; stockQuantity?: number }) {
  const available = getAvailableStock(product)
  const threshold = product.lowStockThreshold ?? 10

  if (available <= 0) {
    return 'out_of_stock' as const
  }

  if (available <= threshold) {
    return 'low_stock' as const
  }

  return 'in_stock' as const
}
