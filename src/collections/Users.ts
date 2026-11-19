import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isAdmin, isAdminBoolean, isAdminField, isAdminOrSameUserField, isAdminOrSelf } from '@/access/isAdmin'
import { normalizeCountry } from '@/lib/address'
import { createAuditLog } from '@/lib/audit'
import { normalizePhone } from '@/lib/phone'

const auditSecurityRelevantUserChange: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  if (operation !== 'update') {
    return doc
  }

  if (previousDoc?.role !== doc.role) {
    await createAuditLog(req.payload, {
      adminId: req.user?.id,
      entityId: doc.id,
      entityReference: doc.email || String(doc.id),
      entityType: 'user',
      event: 'user_role_changed',
      metadata: { from: previousDoc?.role, to: doc.role },
      req,
      summary: `Role modifie: ${previousDoc?.role ?? 'inconnu'} -> ${doc.role}`
    })
  }

  if (previousDoc?.active !== doc.active) {
    await createAuditLog(req.payload, {
      adminId: req.user?.id,
      entityId: doc.id,
      entityReference: doc.email || String(doc.id),
      entityType: 'user',
      event: doc.active === false ? 'user_disabled' : 'user_enabled',
      req,
      summary: doc.active === false ? 'Compte desactive' : 'Compte reactive'
    })
  }

  return doc
}

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
    components: {
      views: {
        list: {
          Component: '@/components/payload/AdminUsersListView#AdminUsersListView'
        }
      }
    },
    group: 'Configuration',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'active', 'lastLoginAt'],
    useAsTitle: 'email'
  },
  labels: {
    plural: 'Clients',
    singular: 'Client'
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production'
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    tokenExpiration: 60 * 60 * 24 * 7,
    // Enables per-session revocation (a `sessions` array on the user doc,
    // matched against the JWT's `sid` claim) instead of purely stateless
    // JWTs that stay valid until expiry no matter what. This is what makes
    // "invalidate other sessions on password change/reset" possible at all
    // — see src/features/auth/service.ts's changePassword/resetPassword.
    useSessions: true
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
      name: 'normalizedPhone',
      type: 'text',
      index: true,
      admin: {
        readOnly: true
      }
    },
    {
      name: 'role',
      type: 'select',
      access: {
        read: isAdminOrSameUserField,
        update: isAdminField
      },
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
      access: {
        // Otherwise a customer disabled by an admin (isAdminOrSelf allows
        // self-update) could simply PATCH their own record and re-enable
        // themselves via Payload's REST/GraphQL/local API.
        update: isAdminField
      },
      defaultValue: true,
      required: true
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      access: {
        // Prevents a customer from self-certifying verification once this
        // flag is actually enforced anywhere (currently cosmetic, but the
        // field-level gap is real today regardless of current usage).
        update: isAdminField
      },
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
        { name: 'delegation', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'governorate', type: 'text', required: true },
        { name: 'locality', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'TN', required: true },
        { name: 'deliveryInstructions', type: 'textarea' },
        { name: 'isDefault', type: 'checkbox', defaultValue: false }
      ]
    }
  ],
  hooks: {
    afterChange: [auditSecurityRelevantUserChange],
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

        if (typeof nextData.phone === 'string') {
          nextData.normalizedPhone = normalizePhone(nextData.phone)
        }

        if (Array.isArray(nextData.addresses)) {
          nextData.addresses = nextData.addresses.map((address: Record<string, unknown>) => ({
            ...address,
            country: normalizeCountry(typeof address.country === 'string' ? address.country : undefined),
            phone: typeof address.phone === 'string' ? normalizePhone(address.phone) || address.phone : address.phone
          }))
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
