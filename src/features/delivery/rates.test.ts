import { describe, expect, it } from 'vitest'

import { calculateZoneDeliveryFee, resolveGovernorateCode } from './rates'

describe('delivery zone rates', () => {
  it('resolves governorate labels and codes', () => {
    expect(resolveGovernorateCode('Tunis')).toBe('tunis')
    expect(resolveGovernorateCode('sfax')).toBe('sfax')
  })

  it('calculates configurable zone fees', () => {
    const zones = [{ active: true, baseFee: 8000, freeDeliveryThreshold: 200000, governorates: ['tunis'] }]

    expect(calculateZoneDeliveryFee(zones, 50000, 'Tunis')).toBe(8000)
    expect(calculateZoneDeliveryFee(zones, 200000, 'Tunis')).toBe(0)
    expect(calculateZoneDeliveryFee(zones, 50000, 'Sfax')).toBeUndefined()
  })
})
