import { headers } from 'next/headers'

import { isLocale, type Locale } from '@/i18n/config'

type LocaleParams = Promise<{ locale?: string } | undefined> | { locale?: string } | undefined

export async function resolveLocaleFromParams(params?: LocaleParams): Promise<Locale> {
  const resolved = params ? await params : undefined
  const rawLocale = resolved?.locale

  if (rawLocale && isLocale(rawLocale)) {
    return rawLocale
  }

  return resolveLocaleFromHeaders()
}

export async function resolveLocaleFromHeaders(): Promise<Locale> {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || '/fr'
  const segment = pathname.split('/').filter(Boolean)[0]

  return isLocale(segment) ? segment : 'fr'
}
