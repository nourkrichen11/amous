import { describe, expect, it } from 'vitest'

import { normalizeSearchParams, parseList, parseMillimePrice, parsePage, parsePageSize } from './searchParams'

describe('catalogue search params', () => {
  it('normalizes array params to the first value', () => {
    expect(normalizeSearchParams({ brand: ['bosch', 'stanley'], category: ['tools', 'garden'] })).toEqual({
      brand: 'bosch,stanley',
      category: 'tools'
    })
  })

  it('parses unique comma-separated filter values', () => {
    expect(parseList('bosch,makita,bosch')).toEqual(['bosch', 'makita'])
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

  it('only accepts supported page sizes', () => {
    expect(parsePageSize('24')).toBe(24)
    expect(parsePageSize('100')).toBe(12)
  })
})
