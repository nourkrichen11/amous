import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { makeGlobalRevalidationHook } from '@/lib/cache/invalidation'
import { STOREFRONT_TAGS } from '@/lib/cache/storefront'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Configuration'
  },
  access: {
    read: () => true,
    update: isAdmin
  },
  hooks: {
    afterChange: [makeGlobalRevalidationHook([STOREFRONT_TAGS.siteSettings])]
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Amous', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'phone', type: 'text' },
    { name: 'whatsappNumber', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'textarea', localized: true },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true }
      ]
    },
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'showAnnouncement', type: 'checkbox', defaultValue: true },
        { name: 'searchPlaceholder', type: 'text', localized: true }
      ]
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        { name: 'copyrightText', type: 'text', localized: true },
        {
          name: 'helpLinks',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'url', type: 'text', required: true }
          ]
        }
      ]
    },
    {
      name: 'defaultSeo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' }
      ]
    }
  ]
}
