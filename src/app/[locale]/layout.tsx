import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { getCategories, getSiteSettings } from '@/features/catalogue/data'
import { getHeader } from '@/features/homepage/data'
import { getCurrentUserSummary } from '@/features/auth/session'
import { getCartCookie } from '@/features/cart/cookies'
import { validateCart } from '@/features/cart/service'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'
import { isLocale, t, type Locale } from '@/i18n/config'

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
  const cartCookie = await getCartCookie()
  const [settings, categories, header, cart, currentUser] = await Promise.all([
    getSiteSettings(normalizedLocale),
    getCategories(normalizedLocale),
    getHeader(normalizedLocale),
    validateCart(cartCookie, normalizedLocale),
    getCurrentUserSummary()
  ])

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t(normalizedLocale, 'navigation.skipToContent')}
      </a>
      <AnnouncementBar text={header.announcementText} />
      <Header cart={cart} currentUser={currentUser} data={header} locale={normalizedLocale} />
      {children}
      <Footer categories={categories} locale={normalizedLocale} settings={settings} />
    </>
  )
}
