import { describe, expect, it } from 'vitest'

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
    expect(normalizeTunisianPhone('50 123 456')).toBe('50123456')
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
