import { describe, expect, it } from 'vitest'

import { getPublicAddress, getPublicEmail, getPublicPhone, getPublicWhatsappNumber } from './contact'

describe('public contact details', () => {
  it('hides seeded placeholder values', () => {
    expect(getPublicPhone('+216 00 000 000')).toBeUndefined()
    expect(getPublicPhone('+216 22 222 222')).toBeUndefined()
    expect(getPublicWhatsappNumber('21600000000')).toBeUndefined()
    expect(getPublicEmail('contact@amous.local')).toBeUndefined()
    expect(getPublicEmail('info@example.com')).toBeUndefined()
    expect(getPublicAddress('   ')).toBeUndefined()
    expect(getPublicAddress('Tunis, Tunisie')).toBeUndefined()
    expect(getPublicAddress('تونس')).toBeUndefined()
  })

  it('keeps and normalizes real-looking values', () => {
    expect(getPublicPhone('50 048 691')).toEqual({ display: '+216 50 048 691', href: 'tel:+21650048691' })
    expect(getPublicWhatsappNumber('+216 50 048 691')).toBe('21650048691')
    expect(getPublicWhatsappNumber('21650048691')).toBe('21650048691')
    expect(getPublicEmail('contact@amous.tn')).toBe('contact@amous.tn')
    expect(getPublicAddress(' Route de Sfax, Sousse ')).toBe('Route de Sfax, Sousse')
  })

  it('rejects malformed values', () => {
    expect(getPublicPhone('abc')).toBeUndefined()
    expect(getPublicEmail('not-an-email')).toBeUndefined()
    expect(getPublicWhatsappNumber(undefined)).toBeUndefined()
  })
})
