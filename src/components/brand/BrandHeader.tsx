import { BrandLogo } from '@/components/brand/BrandLogo'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation/Breadcrumbs'
import type { BrandItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type BrandHeaderProps = {
  brand: BrandItem
  breadcrumbs: BreadcrumbItem[]
  locale: Locale
  /** Published products of the brand, before filters. */
  productCount: number
}

export function BrandHeader({ brand, breadcrumbs, locale, productCount }: BrandHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="container-catalog py-4 sm:py-5">
        <Breadcrumbs items={breadcrumbs} locale={locale} />

        <div className="mt-3 flex items-center gap-4">
          {brand.logo?.url ? (
            <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2 sm:h-20 sm:w-32">
              <BrandLogo brand={brand} className="h-full w-full" locale={locale} sizes="128px" />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold leading-tight text-[var(--color-navy)] sm:text-[1.75rem]">{brand.name}</h1>
              <span className="inline-flex items-center rounded-full bg-[var(--color-navy-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-navy)] sm:text-[13px]">
                {t(locale, productCount > 1 ? 'brands.productsOther' : 'brands.productsOne', { count: productCount })}
              </span>
            </div>
            {brand.description ? (
              <p className="mt-1.5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-[15px]">{brand.description}</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
