import type { Locale } from '@/i18n/config'
import { formatMoney } from '@/lib/money'

export function formatTND(value: number, locale: Locale): string {
  return formatMoney(Math.round(value * 1000), { locale: locale === 'ar' ? 'ar-TN' : 'fr-TN' })
}

export function formatTNDMillimes(value: number, locale: Locale): string {
  return formatMoney(value, { locale: locale === 'ar' ? 'ar-TN' : 'fr-TN' })
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-TN' : 'fr-TN').format(value)
}
