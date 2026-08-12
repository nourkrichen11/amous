import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Contenu',
    useAsTitle: 'altFr'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'center'
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'center'
      },
      {
        name: 'gallery',
        width: 1200,
        height: 900,
        position: 'center'
      },
      {
        name: 'banner',
        width: 1600,
        height: 900,
        position: 'center'
      }
    ]
  },
  fields: [
    {
      name: 'altFr',
      type: 'text',
      required: true
    },
    {
      name: 'altAr',
      type: 'text'
    },
    {
      name: 'caption',
      type: 'text',
      localized: true
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        { name: 'source', type: 'text' },
        { name: 'dominantColor', type: 'text' }
      ]
    }
  ]
}
