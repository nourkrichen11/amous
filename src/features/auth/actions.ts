'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { Locale } from '@/i18n/config'
import { getClientIp } from '@/lib/security/getClientIp'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { RATE_LIMIT_MESSAGE } from '@/lib/security/rateLimitResponse'

import { deleteAddress, saveAddress, changeOwnPassword, loginCustomer, registerCustomer, requestPasswordReset, resetPassword, updateOwnProfile } from './service'
import { getCurrentUser, logoutCurrentUser, requireCustomerUser } from './session'

export type AuthFormState = {
  fieldErrors?: Record<string, string | string[] | undefined>
  message?: string
  ok?: boolean
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function asLocale(value: string): Locale {
  return value === 'ar' ? 'ar' : 'fr'
}

async function isRateLimited(bucket: Parameters<typeof checkRateLimit>[0], identifier: string) {
  const ip = await getClientIp()
  return !checkRateLimit(bucket, `${ip}:${identifier}`).allowed
}

export async function loginAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))
  const email = getValue(formData, 'email').trim().toLowerCase()

  if (await isRateLimited('login', email)) {
    return { message: RATE_LIMIT_MESSAGE }
  }

  const result = await loginCustomer({
    email: getValue(formData, 'email'),
    locale,
    password: getValue(formData, 'password'),
    rememberMe: getValue(formData, 'rememberMe') === 'on',
    returnTo: getValue(formData, 'returnTo') || undefined
  })

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: result.formError
    }
  }

  redirect(result.redirectTo || `/${locale}/mon-compte`)
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))

  if (await isRateLimited('register', 'global')) {
    return { message: RATE_LIMIT_MESSAGE }
  }

  const result = await registerCustomer({
    acceptTerms: getValue(formData, 'acceptTerms') === 'on',
    email: getValue(formData, 'email'),
    firstName: getValue(formData, 'firstName'),
    lastName: getValue(formData, 'lastName'),
    locale,
    password: getValue(formData, 'password'),
    passwordConfirmation: getValue(formData, 'passwordConfirmation'),
    phone: getValue(formData, 'phone') || undefined,
    returnTo: getValue(formData, 'returnTo') || undefined
  })

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: result.formError
    }
  }

  redirect(`${result.redirectTo || `/${locale}/mon-compte`}?status=registered`)
}

export async function forgotPasswordAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))
  const email = getValue(formData, 'email').trim().toLowerCase()

  if (await isRateLimited('forgot-password', email)) {
    // Same generic message as the real flow — rate-limiting must not be a
    // side channel for confirming whether an account exists.
    return { message: RATE_LIMIT_MESSAGE, ok: true }
  }

  const response = await requestPasswordReset({
    email: getValue(formData, 'email'),
    locale
  })

  return {
    message: response.message,
    ok: true
  }
}

export async function resetPasswordAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))

  if (await isRateLimited('reset-password', 'global')) {
    return { message: RATE_LIMIT_MESSAGE }
  }

  const result = await resetPassword(
    {
      password: getValue(formData, 'password'),
      passwordConfirmation: getValue(formData, 'passwordConfirmation'),
      token: getValue(formData, 'token')
    },
    locale
  )

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: result.formError
    }
  }

  redirect(result.redirectTo || `/${locale}/connexion`)
}

export async function updateProfileAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/profil`)
  const result = await updateOwnProfile(user, {
    email: getValue(formData, 'email'),
    firstName: getValue(formData, 'firstName'),
    lastName: getValue(formData, 'lastName'),
    phone: getValue(formData, 'phone') || undefined
  })

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: 'Merci de verifier les informations saisies.'
    }
  }

  revalidatePath(`/${locale}/mon-compte`)
  revalidatePath(`/${locale}/mon-compte/profil`)

  return {
    message: 'Votre profil a ete mis a jour.',
    ok: true
  }
}

export async function changePasswordAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/securite`)

  if (checkRateLimit('change-password', String(user.id)).allowed === false) {
    return { message: RATE_LIMIT_MESSAGE }
  }

  const result = await changeOwnPassword(user, {
    confirmNewPassword: getValue(formData, 'confirmNewPassword'),
    currentPassword: getValue(formData, 'currentPassword'),
    newPassword: getValue(formData, 'newPassword')
  })

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: 'Merci de verifier les informations saisies.'
    }
  }

  return {
    message: 'Votre mot de passe a ete mis a jour.',
    ok: true
  }
}

export async function saveAddressAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = asLocale(getValue(formData, 'locale'))
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/adresses`)
  const result = await saveAddress({
    addressLine1: getValue(formData, 'addressLine1'),
    addressLine2: getValue(formData, 'addressLine2') || undefined,
    city: getValue(formData, 'city'),
    country: 'TN',
    firstName: getValue(formData, 'firstName'),
    governorate: getValue(formData, 'governorate'),
    id: getValue(formData, 'addressId') || undefined,
    isDefault: getValue(formData, 'isDefault') === 'on',
    label: getValue(formData, 'label') || undefined,
    lastName: getValue(formData, 'lastName'),
    phone: getValue(formData, 'phone') || undefined,
    postalCode: getValue(formData, 'postalCode') || undefined,
    userId: user.id
  })

  if (!result.ok) {
    return {
      fieldErrors: result.fieldErrors,
      message: 'Merci de verifier les informations saisies.'
    }
  }

  revalidatePath(`/${locale}/mon-compte`)
  revalidatePath(`/${locale}/mon-compte/adresses`)

  return {
    message: 'Adresse enregistree avec succes.',
    ok: true
  }
}

export async function deleteAddressAction(formData: FormData) {
  const locale = asLocale(getValue(formData, 'locale'))
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/adresses`)
  const addressId = getValue(formData, 'addressId')

  if (addressId) {
    await deleteAddress({
      addressId,
      userId: user.id
    })
  }

  revalidatePath(`/${locale}/mon-compte`)
  revalidatePath(`/${locale}/mon-compte/adresses`)
}

export async function logoutAction(locale: Locale) {
  await logoutCurrentUser()
  redirect(`/${locale}?status=logged-out`)
}

export async function getAuthenticatedCheckoutPrefill(locale: Locale) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'customer') {
    return null
  }

  const defaultAddress = user.addresses.find((address) => address.isDefault) || user.addresses[0]

  return {
    addressLine1: defaultAddress?.addressLine1 || '',
    city: defaultAddress?.city || '',
    email: user.email,
    firstName: defaultAddress?.firstName || user.firstName,
    governorate: defaultAddress?.governorate || '',
    lastName: defaultAddress?.lastName || user.lastName,
    phone: defaultAddress?.phone || user.phone || '',
    postalCode: defaultAddress?.postalCode || '',
    returnToLogin: `/${locale}/commande`
  }
}
