import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  admin: {
    defaultColumns: ['internalName', 'active', 'displayOrder', 'startDate', 'endDate', 'updatedAt'],
    useAsTitle: 'internalName'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: 'internalName',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Internal admin label for this slide.'
      }
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      admin: {
        description: 'Only active published slides inside the configured date range are rendered on the homepage.'
      }
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 10
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional short label shown above the hero title.'
      }
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Required homepage H1 or slide title.'
      }
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true
    },
    {
      name: 'desktopImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Primary desktop hero image.'
      }
    },
    {
      name: 'mobileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional mobile-specific image. Falls back to the desktop image when empty.'
      }
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryCtaLabel',
          type: 'text',
          localized: true
        },
        {
          name: 'primaryCtaUrl',
          type: 'text'
        }
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          localized: true
        },
        {
          name: 'secondaryCtaUrl',
          type: 'text'
        }
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'textAlignment',
          type: 'select',
          defaultValue: 'left',
          required: true,
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]
        },
        {
          name: 'contentPosition',
          type: 'select',
          defaultValue: 'center',
          required: true,
          options: [
            { label: 'Top', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'Bottom', value: 'end' }
          ]
        },
        {
          name: 'textTheme',
          type: 'select',
          defaultValue: 'light',
          required: true,
          options: [
            { label: 'Light text', value: 'light' },
            { label: 'Dark text', value: 'dark' }
          ]
        }
      ]
    },
    {
      name: 'overlayStrength',
      type: 'select',
      defaultValue: 'medium',
      required: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ],
      admin: {
        description: 'Adds a darkened overlay above the image to keep text readable.'
      }
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime'
            },
            description: 'Optional. Leave empty to start showing the slide immediately.'
          }
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime'
            },
            description: 'Optional. Leave empty to keep the slide visible until it is manually deactivated.'
          }
        }
      ]
    }
  ]
}
