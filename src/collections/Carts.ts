import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    defaultColumns: ['identifier', 'status', 'locale', 'updatedAt'],
    useAsTitle: 'identifier'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'identifier', type: 'text', required: true, unique: true, index: true },
    { name: 'anonymousSessionIdentifier', type: 'text', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Converted', value: 'converted' },
        { label: 'Abandoned', value: 'abandoned' }
      ],
      required: true
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'productSku', type: 'text', required: true },
        { name: 'productName', type: 'text', required: true },
        { name: 'productImageUrl', type: 'text' },
        { name: 'unit', type: 'text', required: true },
        { name: 'quantity', type: 'number', min: 1, required: true },
        { name: 'unitPrice', type: 'number', min: 0, required: true },
        { name: 'vatRate', type: 'number', min: 0, required: true },
        { name: 'lineTotal', type: 'number', min: 0, required: true }
      ]
    },
    { name: 'currency', type: 'text', defaultValue: 'TND', required: true },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'fr',
      options: [
        { label: 'French', value: 'fr' },
        { label: 'Arabic', value: 'ar' }
      ],
      required: true
    },
    { name: 'expiresAt', type: 'date', required: true }
  ]
}
