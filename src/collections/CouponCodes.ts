import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const CouponCodes: CollectionConfig = {
  slug: 'coupon-codes',
  admin: {
    defaultColumns: ['code', 'promotion', 'usageLimit', 'usedCount', 'active'],
    group: 'Marketing',
    useAsTitle: 'code'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'promotion', type: 'relationship', relationTo: 'promotions', required: true },
    { name: 'usageLimit', type: 'number', min: 1 },
    { name: 'usedCount', type: 'number', defaultValue: 0, min: 0, required: true },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true }
  ]
}
