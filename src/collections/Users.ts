import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminBoolean, isAdminOrSelf } from '@/access/isAdmin'

type UserDoc = {
  active?: boolean
  firstName?: string
  lastName?: string
  name?: string
}

function trimValue(value?: string | null) {
  return value?.trim() || undefined
}

function buildDisplayName(data?: Partial<UserDoc>) {
  const firstName = trimValue(data?.firstName)
  const lastName = trimValue(data?.lastName)
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim()

  return combined || trimValue(data?.name) || undefined
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'active', 'lastLoginAt'],
    useAsTitle: 'email'
  },
  auth: {
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    tokenExpiration: 60 * 60 * 24 * 7
  },
  access: {
    admin: isAdminBoolean,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true
      }
    },
    {
      name: 'firstName',
      type: 'text',
      required: true
    },
    {
      name: 'lastName',
      type: 'text',
      required: true
    },
    {
      name: 'phone',
      type: 'text'
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'customer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' }
      ],
      required: true
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'fr',
      options: [
        { label: 'French', value: 'fr' },
        { label: 'Arabic', value: 'ar' }
      ],
      required: true
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      required: true
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime'
        }
      }
    },
    {
      name: 'passwordChangedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime'
        }
      }
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'addressLine1', type: 'text', required: true },
        { name: 'addressLine2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'governorate', type: 'text', required: true },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'Tunisia', required: true },
        { name: 'isDefault', type: 'checkbox', defaultValue: false }
      ]
    }
  ],
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'users',
          data: {
            lastLoginAt: new Date().toISOString()
          },
          id: user.id,
          overrideAccess: true
        })
      }
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        const nextData = {
          ...data
        }

        if (typeof nextData.email === 'string') {
          nextData.email = nextData.email.trim().toLowerCase()
        }

        if (typeof nextData.firstName === 'string') {
          nextData.firstName = nextData.firstName.trim()
        }

        if (typeof nextData.lastName === 'string') {
          nextData.lastName = nextData.lastName.trim()
        }

        nextData.name = buildDisplayName({
          ...originalDoc,
          ...nextData
        })

        if (typeof nextData.password === 'string') {
          nextData.passwordChangedAt = new Date().toISOString()
        }

        return nextData
      }
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.active === false) {
          throw new Error('USER_INACTIVE')
        }
      }
    ]
  }
}
