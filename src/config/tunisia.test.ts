import { describe, expect, it } from 'vitest'

import { getGovernorateByCode, getGovernorateByLabel, getGovernorateLabel, isValidGovernorate, tunisiaGovernorates } from './tunisia'

describe('tunisia governorates', () => {
  it('defines the 24 Tunisian governorates once', () => {
    expect(tunisiaGovernorates).toHaveLength(24)
    expect(tunisiaGovernorates.map((governorate) => governorate.code)).toContain('tunis')
    expect(tunisiaGovernorates.map((governorate) => governorate.code)).toContain('sfax')
  })

  it('supports code and label lookup', () => {
    expect(getGovernorateByCode('nabeul')?.label).toBe('Nabeul')
    expect(getGovernorateByLabel('Ben Arous')?.code).toBe('ben-arous')
    expect(getGovernorateLabel('sousse')).toBe('Sousse')
    expect(isValidGovernorate('Tunis')).toBe(true)
    expect(isValidGovernorate('unknown')).toBe(false)
  })
})
