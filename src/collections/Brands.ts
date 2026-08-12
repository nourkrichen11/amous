import type { CollectionConfig } from 'payload'

import { activeOnly, isAdmin } from '@/access/isAdmin'
import { revalidateBrandAfterChange, revalidateBrandAfterDelete } from '@/lib/cache/invalidation'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    defaultColumns: ['name', 'slug', 'displayOrder', 'featured', 'active'],
    group: 'Catalogue',
    useAsTitle: 'name'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: activeOnly,
    update: isAdmin
  },
  hooks: {
    afterChange: [revalidateBrandAfterChange],
    afterDelete: [revalidateBrandAfterDelete]
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media'
    },
    { name: 'website', type: 'text' },
    { name: 'displayOrder', type: 'number', defaultValue: 0, required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true }
      ]
    }
  ]
}
