import { defaultLocale, isLocale, type Locale } from '@/i18n/config'

type LocaleParams = Promise<{ locale?: string } | undefined> | { locale?: string } | undefined

export async function resolveLocaleFromParams(params?: LocaleParams): Promise<Locale> {
  const resolved = params ? await params : undefined
  const rawLocale = resolved?.locale

  if (rawLocale && isLocale(rawLocale)) {
    return rawLocale
  }

  return defaultLocale
}
