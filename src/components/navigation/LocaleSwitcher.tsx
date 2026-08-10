import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type LocaleSwitcherProps = {
  locale: Locale
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const nextLocale = locale === 'fr' ? 'ar' : 'fr'
  const label = locale === 'fr' ? t(locale, 'navigation.switchToArabic') : t(locale, 'navigation.switchToFrench')

  return (
    <Link
      aria-label={label}
      className="inline-flex min-h-[var(--touch-target)] items-center rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold"
      href={`/${nextLocale}`}
      hrefLang={nextLocale}
    >
      {nextLocale.toUpperCase()}
    </Link>
  )
}
