import { commerceConfig } from '@/config/commerce'

export type TunisianAddress = {
  addressLine1: string
  addressLine2?: string
  country: typeof commerceConfig.country
  delegation: string
  deliveryInstructions?: string
  firstName: string
  governorate: string
  lastName: string
  locality?: string
  phone: string
  postalCode?: string
}

export function normalizeCountry(country?: string | null) {
  if (!country) {
    return commerceConfig.country
  }

  return ['tn', 'tunisia', 'tunisie'].includes(country.trim().toLowerCase()) ? commerceConfig.country : country.trim().toUpperCase()
}
