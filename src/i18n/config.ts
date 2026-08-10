import ar from './ar.json'
import fr from './fr.json'

export const locales = ['fr', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const dictionaries = {
  ar,
  fr
} as const

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

export type TranslationKey = string

type Dictionary = typeof fr

export function t(locale: Locale, key: TranslationKey, values?: Record<string, string | number>): string {
  const dictionary = getDictionary(locale) as Dictionary
  const resolved = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }

    return undefined
  }, dictionary)
  const text = typeof resolved === 'string' ? resolved : key

  if (!values) {
    return text
  }

  return Object.entries(values).reduce(
    (current, [name, value]) => current.replaceAll(`{${name}}`, String(value)),
    text
  )
}
