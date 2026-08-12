import Link from 'next/link'

import { defaultLocale, t } from '@/i18n/config'

export default function LocaleNotFound() {
  const locale = defaultLocale

  return (
    <main className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--color-primary)]">404</p>
        <h1 className="text-3xl font-bold">{t(locale, 'common.notFound')}</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">{t(locale, 'catalogue.empty')}</p>
        <Link
          className="mt-6 inline-flex min-h-[var(--touch-target)] items-center rounded-md bg-[var(--color-primary)] px-5 text-white"
          href={`/${locale}`}
        >
          {t(locale, 'navigation.home')}
        </Link>
      </div>
    </main>
  )
}
