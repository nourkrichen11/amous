import Image from 'next/image'
import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { CategoryItem } from '@/features/catalogue/types'
import { cn } from '@/lib/utils/cn'

type CategoryCardProps = {
  category: CategoryItem
  locale: Locale
  variant?: 'compact' | 'detailed'
}

export function formatCategoryProductCount(count: number, locale: Locale): string {
  if (locale === 'ar') {
    return t(locale, 'catalogue.productsCount').replace('{count}', String(count))
  }

  return `${count} ${count > 1 ? 'produits' : 'produit'}`
}

export function CategoryCard({ category, locale, variant = 'compact' }: CategoryCardProps) {
  const isDetailed = variant === 'detailed'
  const imageSrc = category.image?.url || '/images/categories/category-placeholder.webp'

  return (
    <Link
      className="group block h-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-subtle)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[var(--shadow-hover)] focus-visible:border-[var(--color-focus)]"
      href={`/${locale}/c/${category.slug}`}
    >
      <article className="flex h-full flex-col p-3 sm:p-4">
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-image-well)]',
            isDetailed ? 'h-[148px]' : 'h-[112px] sm:h-[132px]'
          )}
        >
          <Image
            alt={category.image?.alt || `Catégorie ${category.name}`}
            className="h-[140px] w-[140px] scale-[1.25] object-contain transition-transform duration-300 group-hover:scale-[1.3] sm:h-[158px] sm:w-[158px]"
            height={180}
            sizes="158px"
            src={imageSrc}
            width={180}
          />
        </div>

        <div className="mt-3 flex grow flex-col sm:mt-4">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--color-navy)] sm:text-base lg:text-lg" title={category.name}>
            {category.name}
          </h3>

          {category.shortDescription ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[var(--color-text-muted)] sm:text-sm">{category.shortDescription}</p>
          ) : null}

          {isDetailed && category.children && category.children.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]" aria-label={`Sous-catégories de ${category.name}`}>
              {category.children.map((child) => (
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-slate-50 px-2 py-1" key={String(child.id)}>
                  {child.name}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3">
            {typeof category.productCount === 'number' ? (
              <span className="text-xs font-medium text-[var(--color-text-muted)] sm:text-[13px]">{formatCategoryProductCount(category.productCount, locale)}</span>
            ) : null}
            <span className="inline-flex min-h-6 items-center text-sm font-semibold text-[var(--color-primary)]">
              Découvrir <span className="ms-1 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
