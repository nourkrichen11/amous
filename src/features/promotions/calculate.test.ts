import { describe, expect, it } from 'vitest'

import { calculatePromotionDiscount, isPromotionActive } from './calculate'

const now = new Date('2026-08-12T10:00:00.000Z')

describe('promotion calculations', () => {
  it('checks active dates and minimum order total', () => {
    expect(isPromotionActive({ active: true, minimumOrderTotal: 100000, type: 'percentage', value: 10 }, 90000, now)).toBe(false)
    expect(isPromotionActive({ active: true, startsAt: '2026-08-13T00:00:00.000Z', type: 'percentage', value: 10 }, 120000, now)).toBe(false)
    expect(isPromotionActive({ active: true, endsAt: '2026-08-13T00:00:00.000Z', type: 'percentage', value: 10 }, 120000, now)).toBe(true)
  })

  it('calculates percentage, fixed, and free shipping discounts in millimes', () => {
    expect(calculatePromotionDiscount({ type: 'percentage', value: 10 }, 219900, 0, now)).toBe(21990)
    expect(calculatePromotionDiscount({ type: 'fixed_amount', value: 50000 }, 30000, 0, now)).toBe(30000)
    expect(calculatePromotionDiscount({ type: 'free_shipping', value: 0 }, 120000, 7000, now)).toBe(7000)
  })
})
