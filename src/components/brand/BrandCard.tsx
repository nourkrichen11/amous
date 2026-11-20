import Link from 'next/link'

import { BrandLogo } from '@/components/brand/BrandLogo'
import type { BrandItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type BrandCardProps = {
  brand: BrandItem
  locale: Locale
}

export function BrandCard({ brand, locale }: BrandCardProps) {
  return (
    <Link
      className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-subtle)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[var(--shadow-hover)] focus-visible:border-[var(--color-focus)] sm:p-4"
      href={`/${locale}/marques/${encodeURIComponent(brand.slug)}`}
    >
      <span className="flex h-24 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-image-well)] px-4 sm:h-28">
        <BrandLogo
          brand={brand}
          className="h-12 w-full max-w-[150px] sm:h-14"
          decorative
          locale={locale}
          sizes="150px"
          textClassName="text-base sm:text-lg"
        />
      </span>
      <span className="mt-3 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[15px] font-bold text-[var(--color-navy)]">{brand.name}</span>
        <span aria-hidden="true" className="shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
          →
        </span>
      </span>
      <span className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'brands.viewProducts')}</span>
    </Link>
  )
}
