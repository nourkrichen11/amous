import './globals.css'

import { headers } from 'next/headers'
import type { ReactNode } from 'react'

import { getDirection, isLocale, type Locale } from '@/i18n/config'

type RootLayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || '/fr'
  const segment = pathname.split('/').filter(Boolean)[0]
  const locale: Locale = segment && isLocale(segment) ? segment : 'fr'

  return (
    <html dir={getDirection(locale)} lang={locale}>
      <body>{children}</body>
    </html>
  )
}
