export type AuthRole = 'admin' | 'customer'

export type AddressInput = {
  addressLine1: string
  addressLine2?: string
  city: string
  country: 'TN' | 'Tunisia'
  delegation?: string
  deliveryInstructions?: string
  firstName: string
  governorate: string
  id?: string
  isDefault: boolean
  label?: string
  lastName: string
  locality?: string
  phone: string
  postalCode?: string
}

export type AuthUser = {
  addresses: AddressInput[]
  email: string
  emailVerified: boolean
  firstName: string
  id: number | string
  lastLoginAt?: string
  lastName: string
  passwordChangedAt?: string
  phone?: string
  preferredLocale: 'fr' | 'ar'
  role: AuthRole
  /**
   * The current request's session id (Payload's `useSessions`, see
   * Users.ts). Used by changePassword to revoke every *other* session while
   * leaving the one the user is actively authenticated with alone.
   */
  sid?: string
}

export type AuthUserSummary = Pick<AuthUser, 'email' | 'firstName' | 'id' | 'lastName' | 'preferredLocale' | 'role'>

export type AuthResult<T = undefined> =
  | {
      data?: T
      fieldErrors?: Record<string, string | string[]>
      formError?: string
      ok: false
    }
  | {
      data?: T
      ok: true
      redirectTo?: string
    }
