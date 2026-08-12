import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrOwnOrder } from '@/access/isAdmin'

export const OrderEvents: CollectionConfig = {
  slug: 'order-events',
  admin: {
    defaultColumns: ['order', 'eventType', 'createdAt', 'admin'],
    group: 'Ventes',
    useAsTitle: 'eventType'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrOwnOrder,
    update: isAdmin
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true, index: true },
    { name: 'eventType', type: 'text', required: true, index: true },
    { name: 'admin', type: 'relationship', relationTo: 'users' },
    { name: 'previousState', type: 'json' },
    { name: 'newState', type: 'json' },
    { name: 'note', type: 'textarea' },
    { name: 'metadata', type: 'json' }
  ]
}
