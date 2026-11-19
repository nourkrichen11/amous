import { describe, expect, it } from 'vitest'

import { getDiscountPercent } from './pricing'

describe('getDiscountPercent', () => {
  it('returns the rounded discount when a higher previous price exists', () => {
    expect(getDiscountPercent({ previousPrice: 189000, publicPrice: 169000 })).toBe(11)
    expect(getDiscountPercent({ previousPrice: 100000, publicPrice: 75000 })).toBe(25)
  })

  it('returns 0 when there is no valid previous price', () => {
    expect(getDiscountPercent({ publicPrice: 169000 })).toBe(0)
    expect(getDiscountPercent({ previousPrice: 169000, publicPrice: 169000 })).toBe(0)
    expect(getDiscountPercent({ previousPrice: 150000, publicPrice: 169000 })).toBe(0)
    expect(getDiscountPercent({ previousPrice: 0, publicPrice: 0 })).toBe(0)
  })
})
