import { describe, expect, it } from 'vitest'

import { getDirection, isLocale, t } from '@/i18n/config'
import { formatTND } from '@/lib/formatting/currency'

describe('localization foundation', () => {
  it('validates supported locales', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('ar')).toBe(true)
    expect(isLocale('en')).toBe(false)
  })

  it('uses RTL for Arabic and LTR for French', () => {
    expect(getDirection('fr')).toBe('ltr')
    expect(getDirection('ar')).toBe('rtl')
  })

  it('uses semantic translation keys', () => {
    expect(t('fr', 'navigation.shop')).toBe('Boutique')
    expect(t('ar', 'navigation.cart')).toBe('السلة')
  })

  it('formats Tunisian dinar prices', () => {
    expect(formatTND(12.5, 'fr')).toMatch(/12/)
  })
})
