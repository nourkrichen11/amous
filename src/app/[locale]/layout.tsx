import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { getDirection, isLocale, type Locale } from '@/i18n/config'
import { getSiteSettings } from '@/features/catalogue/data'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const locale = await resolveLocaleFromParams(params)
  const settings = await getSiteSettings(locale)

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: '/ar',
        fr: '/fr'
      }
    },
    description: settings.defaultSeoDescription || 'Amous, boutique de quincaillerie et bricolage.',
    title: {
      default: settings.defaultSeoTitle || settings.siteName,
      template: `%s | ${settings.siteName}`
    }
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = await resolveLocaleFromParams(params)

  if (!isLocale(locale)) {
    notFound()
  }

  const normalizedLocale: Locale = locale

  return <div dir={getDirection(normalizedLocale)} lang={normalizedLocale}>{children}</div>
}
