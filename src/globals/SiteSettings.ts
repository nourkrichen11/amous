import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdmin
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
