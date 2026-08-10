import configPromise from '@payload-config'
import { login as payloadLogin } from '@payloadcms/next/auth'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/config'

import type { AddressInput, AuthResult, AuthUserSummary } from './types'
import {
  addressSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  isValidReturnTo,
  loginSchema,
  normalizeEmail,
  normalizeTunisianPhone,
  profileSchema,
  registerSchema,
  resetPasswordSchema
} from './validation'

const genericInvalidCredentials = 'Adresse e-mail ou mot de passe incorrect.'
const genericForgotPasswordMessage = 'Si un compte correspond a cette adresse, un lien de reinitialisation sera envoye.'

function mapUserSummary(user: Record<string, unknown>): AuthUserSummary {
  return {
    email: String(user.email || ''),
    firstName: String(user.firstName || ''),
    id: user.id as number | string,
    lastName: String(user.lastName || ''),
    preferredLocale: user.preferredLocale === 'ar' ? 'ar' : 'fr',
    role: user.role === 'admin' ? 'admin' : 'customer'
  }
}

function resolveReturnTo(locale: Locale, returnTo?: string | null, fallback = `/${locale}/mon-compte`) {
  return isValidReturnTo(returnTo) ? String(returnTo) : fallback
}

async function getPayloadClient() {
  return getPayload({ config: configPromise, cron: true })
}

export async function registerCustomer(input: {
  acceptTerms: boolean
  email: string
  firstName: string
  lastName: string
  locale: Locale
  password: string
  passwordConfirmation: string
  phone?: string
  returnTo?: string
}): Promise<AuthResult<AuthUserSummary>> {
  const parsed = registerSchema.safeParse({
    ...input,
    acceptTerms: input.acceptTerms
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      formError: 'Merci de verifier les informations saisies.',
      ok: false
    }
  }

  const payload = await getPayloadClient()
  const email = normalizeEmail(parsed.data.email)
  const phone = normalizeTunisianPhone(parsed.data.phone)
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: email
      }
    }
  })

  if (existing.docs[0]) {
    return {
      fieldErrors: {
        email: "Cette adresse e-mail est deja utilisee."
      },
      ok: false
    }
  }

  const created = await payload.create({
    collection: 'users',
    data: {
      active: true,
      email,
      emailVerified: false,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      password: parsed.data.password,
      phone,
      preferredLocale: input.locale,
      role: 'customer'
    },
    overrideAccess: true
  })

  const loginResult = await payloadLogin({
    collection: 'users',
    config: configPromise,
    email,
    password: parsed.data.password
  })

  return {
      data: mapUserSummary((loginResult.user || created) as Record<string, unknown>),
      ok: true,
      redirectTo: resolveReturnTo(input.locale, input.returnTo)
  }
}

export async function loginCustomer(input: {
  email: string
  locale: Locale
  password: string
  rememberMe?: boolean
  returnTo?: string
}): Promise<AuthResult<AuthUserSummary>> {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      formError: genericInvalidCredentials,
      ok: false
    }
  }

  try {
    const result = await payloadLogin({
      collection: 'users',
      config: configPromise,
      email: normalizeEmail(parsed.data.email),
      password: parsed.data.password
    })

    const user = result.user as Record<string, unknown>
    if (user.role !== 'customer') {
      return { formError: genericInvalidCredentials, ok: false }
    }

    return {
      data: mapUserSummary(user),
      ok: true,
      redirectTo: resolveReturnTo(input.locale, parsed.data.returnTo)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('USER_INACTIVE')) {
      return {
        formError: 'Votre compte est desactive. Merci de contacter Amous.',
        ok: false
      }
    }

    return {
      formError: genericInvalidCredentials,
      ok: false
    }
  }
}

export async function loginAdmin(input: { email: string; password: string }): Promise<AuthResult<AuthUserSummary>> {
  try {
    const result = await payloadLogin({
      collection: 'users',
      config: configPromise,
      email: normalizeEmail(input.email),
      password: input.password
    })

    const user = result.user as Record<string, unknown>
    if (user.role !== 'admin') {
      return {
        formError: genericInvalidCredentials,
        ok: false
      }
    }

    return {
      data: mapUserSummary(user),
      ok: true,
      redirectTo: '/admin'
    }
  } catch {
    return {
      formError: genericInvalidCredentials,
      ok: false
    }
  }
}

export async function requestPasswordReset(input: { email: string }) {
  const parsed = forgotPasswordSchema.safeParse(input)

  if (!parsed.success) {
    return {
      message: genericForgotPasswordMessage
    }
  }

  try {
    const payload = await getPayloadClient()
    await payload.forgotPassword({
      collection: 'users',
      data: {
        email: normalizeEmail(parsed.data.email)
      },
      disableEmail: true,
      expiration: 45 * 60 * 1000
    })
  } catch {
    // Keep generic response to prevent enumeration.
  }

  return {
    message: genericForgotPasswordMessage
  }
}

export async function resetPassword(input: { password: string; passwordConfirmation: string; token: string }, locale: Locale): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      formError: 'Merci de verifier les informations saisies.',
      ok: false
    }
  }

  try {
    const payload = await getPayloadClient()
    await payload.resetPassword({
      collection: 'users',
      data: {
        password: parsed.data.password,
        token: parsed.data.token
      },
      overrideAccess: true
    })

    return {
      ok: true,
      redirectTo: `/${locale}/connexion?status=password-reset-success`
    }
  } catch {
    return {
      formError: 'Le lien de reinitialisation est invalide ou expire.',
      ok: false
    }
  }
}

export async function updateProfile(input: { email: string; firstName: string; lastName: string; phone?: string; userId: number | string }) {
  const parsed = profileSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      ok: false as const
    }
  }

  const payload = await getPayloadClient()
  const normalizedEmail = normalizeEmail(parsed.data.email)
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        {
          email: {
            equals: normalizedEmail
          }
        },
        {
          id: {
            not_equals: input.userId
          }
        }
      ]
    }
  })

  if (existing.docs[0]) {
    return {
      fieldErrors: {
        email: "Cette adresse e-mail est deja utilisee."
      },
      ok: false as const
    }
  }

  await payload.update({
    collection: 'users',
    data: {
      email: normalizedEmail,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: normalizeTunisianPhone(parsed.data.phone)
    },
    id: input.userId,
    overrideAccess: true
  })

  return {
    ok: true as const
  }
}

export async function changePassword(input: { confirmNewPassword: string; currentPassword: string; email: string; newPassword: string; userId: number | string }) {
  const parsed = changePasswordSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      ok: false as const
    }
  }

  const payload = await getPayloadClient()

  try {
    await payload.login({
      collection: 'users',
      data: {
        email: normalizeEmail(input.email),
        password: parsed.data.currentPassword
      }
    })
  } catch {
    return {
      fieldErrors: {
        currentPassword: 'Le mot de passe actuel est incorrect.'
      },
      ok: false as const
    }
  }

  await payload.update({
    collection: 'users',
    data: {
      password: parsed.data.newPassword,
      passwordChangedAt: new Date().toISOString()
    },
    id: input.userId,
    overrideAccess: true
  })

  return {
    ok: true as const
  }
}

export async function saveAddress(input: (Omit<AddressInput, 'phone'> & { phone?: string }) & { userId: number | string }) {
  const parsed = addressSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      ok: false as const
    }
  }

  const payload = await getPayloadClient()
  const user = (await payload.findByID({
    collection: 'users',
    id: input.userId,
    overrideAccess: true
  })) as { addresses?: AddressInput[] }

  const currentAddresses = Array.isArray(user.addresses) ? [...user.addresses] : []
  const address = {
    ...parsed.data,
    phone: normalizeTunisianPhone(parsed.data.phone) || ''
  }
  const nextAddresses = currentAddresses.filter((entry) => entry.id !== input.id)

  nextAddresses.push(
    input.id
      ? {
          ...address,
          id: input.id
        }
      : address
  )

  const normalizedAddresses = nextAddresses.map((entry) => ({
    ...entry,
    isDefault: address.isDefault ? entry.id === input.id || (!input.id && entry === nextAddresses[nextAddresses.length - 1]) : entry.isDefault
  }))

  const finalAddresses = normalizedAddresses.some((entry) => entry.isDefault)
    ? normalizedAddresses
    : normalizedAddresses.map((entry, index) => ({
        ...entry,
        isDefault: index === 0
      }))

  await payload.update({
    collection: 'users',
    data: {
      addresses: finalAddresses
    },
    id: input.userId,
    overrideAccess: true
  })

  return {
    ok: true as const
  }
}

export async function deleteAddress(input: { addressId: string; userId: number | string }) {
  const payload = await getPayloadClient()
  const user = (await payload.findByID({
    collection: 'users',
    id: input.userId,
    overrideAccess: true
  })) as { addresses?: AddressInput[] }

  const currentAddresses = Array.isArray(user.addresses) ? [...user.addresses] : []
  const nextAddresses = currentAddresses.filter((address) => address.id !== input.addressId)
  const finalAddresses = nextAddresses.map((address, index) => ({
    ...address,
    isDefault: nextAddresses.some((entry) => entry.isDefault) ? address.isDefault : index === 0
  }))

  await payload.update({
    collection: 'users',
    data: {
      addresses: finalAddresses
    },
    id: input.userId,
    overrideAccess: true
  })

  return {
    ok: true as const
  }
}
