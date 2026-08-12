import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { getCategories, getSiteSettings } from '@/features/catalogue/data'
import { getHeader } from '@/features/homepage/data'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type StorefrontLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const locale = await resolveLocaleFromParams(params)
  const [settings, categories, header] = await Promise.all([
    getSiteSettings(locale),
    getCategories(locale),
    getHeader(locale)
  ])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <AnnouncementBar text={header.announcementText} />
      <Header data={header} locale={locale} />
      {children}
      <Footer categories={categories} locale={locale} settings={settings} />
    </>
  )
}
