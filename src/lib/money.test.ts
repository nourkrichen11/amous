import { describe, expect, it } from 'vitest'

import { calculateLine, calculateTotals, dinarsToMillimes, formatMoney, getVatFromTaxIncluded, millimesToDinars, multiplyMoney } from './money'

describe('money utilities', () => {
  it('multiplies millime values without floating point drift', () => {
    expect(multiplyMoney(12500, 3)).toBe(37500)
  })

  it('extracts VAT from a tax-included total', () => {
    expect(getVatFromTaxIncluded(119000, 19)).toBe(19000)
  })

  it('calculates line totals and cart totals', () => {
    const line = calculateLine(119000, 2, 19)
    expect(line).toEqual({ lineSubtotal: 200000, lineTotal: 238000, lineVatTotal: 38000 })
    expect(calculateTotals([line], 7000)).toEqual({ subtotal: 200000, total: 245000, vatTotal: 38000 })
  })

  it('converts and formats Tunisian millimes', () => {
    expect(dinarsToMillimes('219,900')).toBe(219900)
    expect(millimesToDinars(219900)).toBe(219.9)
    expect(formatMoney(219000)).toBe('219 DT')
    expect(formatMoney(219500)).toBe('219,500 DT')
  })
})
