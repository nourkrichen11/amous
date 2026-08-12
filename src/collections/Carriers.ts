import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Carriers: CollectionConfig = {
  slug: 'carriers',
  admin: {
    defaultColumns: ['name', 'phone', 'active', 'updatedAt'],
    group: 'Livraison',
    useAsTitle: 'name'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'trackingUrlTemplate', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true },
    { name: 'notes', type: 'textarea' }
  ]
}
