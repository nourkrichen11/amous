import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Shipments: CollectionConfig = {
  slug: 'shipments',
  admin: {
    defaultColumns: ['order', 'carrier', 'status', 'trackingNumber', 'updatedAt'],
    group: 'Livraison',
    useAsTitle: 'trackingNumber'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true, index: true },
    { name: 'carrier', type: 'relationship', relationTo: 'carriers' },
    { name: 'trackingNumber', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Expediee', value: 'shipped' },
        { label: 'Livree', value: 'delivered' },
        { label: 'Echec', value: 'failed' },
        { label: 'Retournee', value: 'returned' }
      ],
      required: true,
      index: true
    },
    { name: 'shippedAt', type: 'date' },
    { name: 'deliveredAt', type: 'date' },
    { name: 'notes', type: 'textarea' }
  ]
}
