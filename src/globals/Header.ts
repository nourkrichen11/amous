import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const HeaderGlobal: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: isAdmin
  },
  admin: {
    group: 'Content'
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional uploaded logo used in the storefront header.'
      }
    },
    {
      name: 'announcementText',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional short announcement shown above the main header.'
      }
    },
    {
      name: 'searchPlaceholder',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Localized placeholder for the large storefront search field.'
      }
    },
    {
      name: 'navigationItems',
      type: 'array',
      minRows: 1,
      maxRows: 9,
      labels: {
        plural: 'Navigation items',
        singular: 'Navigation item'
      },
      admin: {
        description: 'Main desktop and mobile navigation items. Keep this list concise.'
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          admin: {
            description: 'Visible navigation label.'
          }
        },
        {
          name: 'url',
          type: 'text',
          localized: true,
          required: true,
          admin: {
            description: 'Localized internal path such as /fr/boutique or /ar/المتجر.'
          }
        },
        {
          name: 'isCategoryTrigger',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable this for the Categories item to prepare the future mega menu trigger styling.'
          }
        }
      ]
    },
    {
      name: 'showAccount',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'showWishlist',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'showCart',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'stickyHeaderEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Keeps the storefront header sticky and enables the compact scrolled state.'
      }
    }
  ]
}
