export type MoneyTotals = {
  subtotal: number
  vatTotal: number
  total: number
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
