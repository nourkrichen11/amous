import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { getDeliveryConfig } from '@/features/cart/delivery'
import { getSiteSettings } from '@/features/catalogue/data'
import { getHeader } from '@/features/homepage/data'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type StorefrontLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const locale = await resolveLocaleFromParams(params)
  const [settings, header, delivery] = await Promise.all([getSiteSettings(locale), getHeader(locale), getDeliveryConfig(locale)])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <AnnouncementBar text={header.announcementText} />
      <Header data={header} locale={locale} />
      {children}
      <Footer delivery={delivery} locale={locale} settings={settings} />
    </>
  )
}
