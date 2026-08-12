export const commerceConfig = {
  country: 'TN',
  currency: 'TND',
  currencySymbol: 'DT',
  defaultLocale: 'fr-TN',
  fallbackLocale: 'fr',
  timezone: 'Africa/Tunis'
} as const

export type CommerceCurrency = typeof commerceConfig.currency

export const productUnits = [
  { label: 'Piece', value: 'piece' },
  { label: 'Unite', value: 'unit' },
  { label: 'Boite', value: 'box' },
  { label: 'Lot', value: 'lot' },
  { label: 'Metre', value: 'metre' },
  { label: 'Metre carre', value: 'square_metre' },
  { label: 'Kilogramme', value: 'kilogram' },
  { label: 'Litre', value: 'litre' },
  { label: 'Paire', value: 'pair' },
  { label: 'Rouleau', value: 'roll' },
  { label: 'Sac', value: 'bag' },
  { label: 'Pack', value: 'pack' }
] as const

export type ProductUnit = (typeof productUnits)[number]['value']

export function getProductUnitLabel(unit: string) {
  return productUnits.find((entry) => entry.value === unit)?.label ?? unit
}
