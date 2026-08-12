import './globals.css'
import './admin.css'

import type { ReactNode } from 'react'

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html dir="ltr" lang="fr">
      <body>{children}</body>
    </html>
  )
}
