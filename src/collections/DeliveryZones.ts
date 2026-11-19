import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { governorateOptions } from '@/config/tunisia'

export const DeliveryZones: CollectionConfig = {
  slug: 'delivery-zones',
  admin: {
    defaultColumns: ['name', 'governorates', 'baseFee', 'freeDeliveryThreshold', 'active'],
    group: 'Livraison',
    useAsTitle: 'name'
  },
  labels: {
    plural: 'Zones et tarifs',
    singular: 'Zone de livraison'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'governorates',
      type: 'select',
      hasMany: true,
      options: governorateOptions(),
      required: true,
      index: true
    },
    {
      name: 'baseFee',
      type: 'number',
      min: 0,
      required: true,
      admin: {
        description: 'Frais de livraison en millimes.'
      }
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      min: 0,
      admin: {
        description: 'Seuil optionnel en millimes.'
      }
    },
    { name: 'estimatedDelay', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true }
  ]
}
