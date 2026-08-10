import { describe, expect, it } from 'vitest'

import { calculateDeliveryFee } from './delivery'
import type { DeliveryConfigView } from './types'

const config: DeliveryConfigView = {
  defaultDeliveryFee: 7000,
  freeDeliveryThreshold: 150000,
  homeDeliveryEnabled: true,
  storePickupEnabled: false,
  supportedGovernorates: ['Tunis', 'Ariana']
}

describe('delivery calculation', () => {
  it('applies the default delivery fee', () => {
    expect(calculateDeliveryFee(config, 50000, 'Tunis')).toEqual({ cost: 7000 })
  })

  it('applies free delivery threshold', () => {
    expect(calculateDeliveryFee(config, 150000, 'Tunis')).toEqual({ cost: 0 })
  })

  it('rejects unsupported zones', () => {
    expect(calculateDeliveryFee(config, 50000, 'Sfax')).toEqual({ cost: 0, issue: 'unsupported_delivery_zone' })
  })
})
