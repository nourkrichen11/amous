export type MoneyTotals = {
  subtotal: number
  vatTotal: number
  total: number
}

export function dinarsToMillimes(value: number | string): number {
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value
  const numeric = Number(normalized)

  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0
  }

  return Math.round(numeric * 1000)
}

export function millimesToDinars(value: number): number {
  return value / 1000
}

export function addMoney(...values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}

export function subtractMoney(value: number, ...subtractors: number[]): number {
  return subtractors.reduce((next, subtractor) => next - subtractor, value)
}

export function multiplyMoney(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

export function getVatFromTaxIncluded(total: number, vatRate: number): number {
  if (vatRate <= 0 || total <= 0) {
    return 0
  }

  return Math.round((total * vatRate) / (100 + vatRate))
}

export function calculateLine(unitPrice: number, quantity: number, vatRate: number) {
  const lineTotal = multiplyMoney(unitPrice, quantity)
  const lineVatTotal = getVatFromTaxIncluded(lineTotal, vatRate)

  return {
    lineSubtotal: lineTotal - lineVatTotal,
    lineTotal,
    lineVatTotal
  }
}

export function calculateTotals(lines: Array<{ lineSubtotal: number; lineTotal: number; lineVatTotal: number }>, deliveryCost = 0): MoneyTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineSubtotal, 0)
  const vatTotal = lines.reduce((sum, line) => sum + line.lineVatTotal, 0)
  const itemTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  return {
    subtotal,
    total: itemTotal + deliveryCost,
    vatTotal
  }
}

export function formatMoney(amountInMillimes: number, options: { hideZeroMillimes?: boolean; locale?: string } = {}): string {
  const locale = options.locale ?? 'fr-TN'
  const dinars = millimesToDinars(amountInMillimes)
  const hasFraction = Math.abs(amountInMillimes) % 1000 !== 0

  const value = new Intl.NumberFormat(locale, {
    maximumFractionDigits: hasFraction || options.hideZeroMillimes === false ? 3 : 0,
    minimumFractionDigits: hasFraction ? 3 : 0,
    useGrouping: true
  }).format(dinars)

  return `${value} DT`
}
