import { describe, expect, it } from 'vitest'

import {
  buildCustomerRegistrationData,
  resolveCustomerLoginRedirect
} from './service'
import {
  changePasswordSchema,
  isValidReturnTo,
  normalizeEmail,
  normalizeTunisianPhone,
  registerSchema
} from './validation'

describe('auth validation', () => {
  it('normalizes email addresses to lowercase without surrounding spaces', () => {
    expect(normalizeEmail('  CLIENT@Example.COM ')).toBe('client@example.com')
  })

  it('normalizes Tunisian phone numbers consistently', () => {
    expect(normalizeTunisianPhone('50 123 456')).toBe('+21650123456')
    expect(normalizeTunisianPhone('+216 50 123 456')).toBe('+21650123456')
    expect(normalizeTunisianPhone('21650123456')).toBe('+21650123456')
  })

  it('accepts only safe internal return URLs', () => {
    expect(isValidReturnTo('/fr/mon-compte')).toBe(true)
    expect(isValidReturnTo('/fr/commande')).toBe(true)
    expect(isValidReturnTo('https://amous.tn/fr/mon-compte')).toBe(false)
    expect(isValidReturnTo('//evil.example')).toBe(false)
    expect(isValidReturnTo('/admin')).toBe(false)
  })

  it('routes admin users from storefront login to Payload admin', () => {
    expect(
      resolveCustomerLoginRedirect(
        {
          email: 'admin@amous.tn',
          firstName: 'Admin',
          id: 1,
          lastName: 'Amous',
          preferredLocale: 'fr',
          role: 'admin'
        },
        'fr',
        '/fr/commande'
      )
    ).toBe('/admin')
  })

  it('routes customer users only to safe storefront paths', () => {
    expect(
      resolveCustomerLoginRedirect(
        {
          email: 'client@example.com',
          firstName: 'Client',
          id: 2,
          lastName: 'Amous',
          preferredLocale: 'fr',
          role: 'customer'
        },
        'fr',
        'https://evil.example'
      )
    ).toBe('/fr/mon-compte')
  })

  it('builds public registration data with the customer role only', () => {
    const data = buildCustomerRegistrationData({
      email: ' CLIENT@EXAMPLE.COM ',
      firstName: 'Client',
      lastName: 'Amous',
      locale: 'fr',
      password: 'motdepasse1',
      phone: '50 123 456'
    })

    expect(data).toMatchObject({
      email: 'client@example.com',
      normalizedPhone: '+21650123456',
      phone: '+21650123456',
      preferredLocale: 'fr',
      role: 'customer'
    })
  })

  it('prevents registration when password confirmation does not match', () => {
    const result = registerSchema.safeParse({
      acceptTerms: true,
      email: 'client@example.com',
      firstName: 'Amine',
      lastName: 'Ben Salem',
      password: 'motdepasse1',
      passwordConfirmation: 'motdepasse2',
      phone: '50123456'
    })

    expect(result.success).toBe(false)
  })

  it('requires the current password and a strong new password for password changes', () => {
    const result = changePasswordSchema.safeParse({
      confirmNewPassword: '12345678',
      currentPassword: '',
      newPassword: '12345678'
    })

    expect(result.success).toBe(false)
  })
})
