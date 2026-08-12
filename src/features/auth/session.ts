import configPromise from '@payload-config'
import { logout as payloadLogout } from '@payloadcms/next/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createLocalReq } from 'payload'

import type { Locale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload/getPayload'

import type { AuthUser, AuthUserSummary } from './types'
import { isValidReturnTo } from './validation'

function mapUser(user: Record<string, unknown> | null | undefined): AuthUser | null {
  if (!user?.id || typeof user.email !== 'string' || typeof user.role !== 'string') {
    return null
  }

  return {
    addresses: Array.isArray(user.addresses) ? (user.addresses as AuthUser['addresses']) : [],
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    firstName: typeof user.firstName === 'string' ? user.firstName : '',
    id: user.id as string | number,
    lastLoginAt: typeof user.lastLoginAt === 'string' ? user.lastLoginAt : undefined,
    lastName: typeof user.lastName === 'string' ? user.lastName : '',
    passwordChangedAt: typeof user.passwordChangedAt === 'string' ? user.passwordChangedAt : undefined,
    phone: typeof user.phone === 'string' ? user.phone : undefined,
    preferredLocale: user.preferredLocale === 'ar' ? 'ar' : 'fr',
    role: user.role === 'admin' ? 'admin' : 'customer'
  }
}

export async function getAuthState() {
  const payload = await getPayloadClient()
  const headerStore = await headers()
  const req = await createLocalReq({}, payload)
  const authResult = await payload.auth({
    canSetHeaders: false,
    headers: headerStore,
    req
  })

  return {
    permissions: authResult.permissions,
    user: mapUser(authResult.user as Record<string, unknown> | null | undefined)
  }
}

export async function getCurrentUser() {
  const { user } = await getAuthState()
  return user
}

export async function getCurrentUserSummary(): Promise<AuthUserSummary | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return {
    email: user.email,
    firstName: user.firstName,
    id: user.id,
    lastName: user.lastName,
    preferredLocale: user.preferredLocale,
    role: user.role
  }
}

export async function requireCustomerUser(locale: Locale, returnTo?: string) {
  const user = await getCurrentUser()

  if (!user) {
    const nextPath = returnTo && isValidReturnTo(returnTo) ? returnTo : `/${locale}/mon-compte`
    redirect(`/${locale}/connexion?returnTo=${encodeURIComponent(nextPath)}`)
  }

  if (user.role !== 'customer') {
    redirect(`/${locale}`)
  }

  return user
}

export async function requireAdminUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin')
  }

  if (user.role !== 'admin') {
    redirect('/fr')
  }

  return user
}

export async function requireAdminAccess() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentification requise.',
        status: 401 as const
      },
      user: null
    }
  }

  if (user.role !== 'admin') {
    return {
      error: {
        code: 'ADMIN_ACCESS_DENIED',
        message: "Ce compte n'est pas autorise a acceder a l'administration.",
        status: 403 as const
      },
      user: null
    }
  }

  return {
    error: null,
    user
  }
}

export async function logoutCurrentUser() {
  return payloadLogout({
    config: configPromise
  })
}
