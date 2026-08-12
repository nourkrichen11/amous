import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { makeGlobalRevalidationHook } from '@/lib/cache/invalidation'
import { STOREFRONT_TAGS } from '@/lib/cache/storefront'

export const DeliveryConfig: GlobalConfig = {
  slug: 'delivery-config',
  admin: {
    group: 'Livraison'
  },
  access: {
    read: () => true,
    update: isAdmin
  },
  hooks: {
    afterChange: [makeGlobalRevalidationHook([STOREFRONT_TAGS.deliveryConfig])]
  },
  fields: [
    { name: 'homeDeliveryEnabled', type: 'checkbox', defaultValue: true, required: true },
    {
      name: 'defaultDeliveryFee',
      type: 'number',
      defaultValue: 7000,
      min: 0,
      required: true,
      admin: {
        description: 'Stored in millimes. Example: 7000 = 7.000 TND.'
      }
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional threshold in millimes.'
      }
    },
    {
      name: 'supportedGovernorates',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }]
    },
    { name: 'storePickupEnabled', type: 'checkbox', defaultValue: false, required: true },
    { name: 'estimatedDeliveryText', type: 'text', localized: true }
  ]
}
