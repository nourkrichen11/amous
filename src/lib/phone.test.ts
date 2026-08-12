import { describe, expect, it } from 'vitest'

import { formatPhoneForDisplay, isValidTunisianPhone, normalizePhone, phoneSearchToken } from './phone'

describe('Tunisian phone utilities', () => {
  it('normalizes common Tunisian formats', () => {
    expect(normalizePhone('50048691')).toBe('+21650048691')
    expect(normalizePhone('50 048 691')).toBe('+21650048691')
    expect(normalizePhone('+21650048691')).toBe('+21650048691')
    expect(normalizePhone('+216 50 048 691')).toBe('+21650048691')
    expect(normalizePhone('0021650048691')).toBe('+21650048691')
  })

  it('validates Tunisian numbers and preserves display/search helpers', () => {
    expect(isValidTunisianPhone('50 048 691')).toBe(true)
    expect(isValidTunisianPhone('12 048 691')).toBe(false)
    expect(formatPhoneForDisplay('50048691')).toBe('+216 50 048 691')
    expect(phoneSearchToken('+216 50 048 691')).toBe('21650048691')
  })
})
