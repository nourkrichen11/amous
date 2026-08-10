import { describe, expect, it } from 'vitest'

import { normalizeSearchParams, parseMillimePrice, parsePage } from './searchParams'

describe('catalogue search params', () => {
  it('normalizes array params to the first value', () => {
    expect(normalizeSearchParams({ brand: ['bosch', 'stanley'] })).toEqual({ brand: 'bosch' })
  })

  it('parses display TND values into millimes', () => {
    expect(parseMillimePrice('12.5')).toBe(12500)
    expect(parseMillimePrice('-2')).toBeUndefined()
  })

  it('restores valid page values from URL params', () => {
    expect(parsePage('3')).toBe(3)
    expect(parsePage('0')).toBe(1)
    expect(parsePage('abc')).toBe(1)
  })
})
