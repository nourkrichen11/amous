import { describe, expect, it } from 'vitest'

import { getAvailableStock, getStockStatus } from './status'

describe('inventory status', () => {
  it('derives available stock from physical and reserved stock', () => {
    expect(getAvailableStock({ reservedStock: 3, stockQuantity: 10 })).toBe(7)
    expect(getAvailableStock({ reservedStock: 12, stockQuantity: 10 })).toBe(0)
  })

  it('uses per-product low stock thresholds', () => {
    expect(getStockStatus({ lowStockThreshold: 5, reservedStock: 0, stockQuantity: 12 })).toBe('in_stock')
    expect(getStockStatus({ lowStockThreshold: 5, reservedStock: 7, stockQuantity: 12 })).toBe('low_stock')
    expect(getStockStatus({ lowStockThreshold: 5, reservedStock: 12, stockQuantity: 12 })).toBe('out_of_stock')
  })
})
