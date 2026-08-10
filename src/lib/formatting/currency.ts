import type { Locale } from '@/i18n/config'

export function formatTND(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-TN' : 'fr-TN', {
    currency: 'TND',
    maximumFractionDigits: 3,
    style: 'currency'
  }).format(value)
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-TN' : 'fr-TN').format(value)
}
