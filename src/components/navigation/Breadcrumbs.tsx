import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  locale: Locale
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const allItems = [{ href: `/${locale}`, label: t(locale, 'navigation.home') }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {allItems.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link className="hover:text-[var(--color-primary)]" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[var(--color-text)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
