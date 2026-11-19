import Image from 'next/image'

import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation/Breadcrumbs'
import type { CategoryItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

type CategoryHeaderProps = {
  breadcrumbs: BreadcrumbItem[]
  category: CategoryItem
  locale: Locale
  /** Published products in the category (and its subcategories), before filters. */
  productCount: number
}

function formatCount(count: number) {
  return `${new Intl.NumberFormat('fr-TN').format(count)} ${count > 1 ? 'produits' : 'produit'}`
}

export function CategoryHeader({ breadcrumbs, category, locale, productCount }: CategoryHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="container-catalog py-4 sm:py-5">
        <Breadcrumbs items={breadcrumbs} locale={locale} />

        <div className="mt-3 flex items-center gap-4">
          {category.image?.url ? (
            <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-image-well)] sm:block">
              <Image alt="" className="scale-125 object-contain" fill priority sizes="64px" src={category.image.url} />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold leading-tight text-[var(--color-navy)] sm:text-[1.75rem]">{category.name}</h1>
              <span className="inline-flex items-center rounded-full bg-[var(--color-navy-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-navy)] sm:text-[13px]">
                {formatCount(productCount)}
              </span>
            </div>
            {category.shortDescription ? (
              <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-[15px]">{category.shortDescription}</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
