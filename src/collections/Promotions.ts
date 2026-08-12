import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    defaultColumns: ['name', 'type', 'value', 'startsAt', 'endsAt', 'active'],
    group: 'Marketing',
    useAsTitle: 'name'
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
      name: 'type',
      type: 'select',
      defaultValue: 'percentage',
      options: [
        { label: 'Pourcentage', value: 'percentage' },
        { label: 'Montant fixe', value: 'fixed_amount' },
        { label: 'Livraison offerte', value: 'free_shipping' }
      ],
      required: true
    },
    { name: 'value', type: 'number', min: 0, required: true },
    { name: 'minimumOrderTotal', type: 'number', min: 0 },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true }
  ]
}
