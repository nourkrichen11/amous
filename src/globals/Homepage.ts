import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { makeGlobalRevalidationHook } from '@/lib/cache/invalidation'
import { STOREFRONT_TAGS } from '@/lib/cache/storefront'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: "Page d'accueil",
  admin: {
    group: 'Contenu'
  },
  access: {
    read: () => true,
    update: isAdmin
  },
  hooks: {
    afterChange: [makeGlobalRevalidationHook([STOREFRONT_TAGS.homepage])]
  },
  fields: [
    { name: 'announcementText', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', localized: true, required: true },
    { name: 'heroSubtitle', type: 'textarea', localized: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'heroCtaLabel', type: 'text', localized: true },
    { name: 'heroCtaUrl', type: 'text', defaultValue: '/fr/boutique' },
    {
      name: 'featuredCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      maxRows: 8
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 12
    },
    {
      name: 'featuredBrands',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
      maxRows: 8
    },
    {
      name: 'benefits',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true }
      ]
    }
  ]
}
