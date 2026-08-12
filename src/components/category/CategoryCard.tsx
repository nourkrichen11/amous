import Image from 'next/image'
import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import type { CategoryItem } from '@/features/catalogue/types'

type CategoryCardProps = {
  category: CategoryItem
  locale: Locale
  variant?: 'compact' | 'detailed'
}

export function CategoryCard({ category, locale, variant = 'compact' }: CategoryCardProps) {
  const isDetailed = variant === 'detailed'
  const imageSrc = category.image?.url || '/images/categories/category-placeholder.webp'
  const imageHeightClass = isDetailed ? 'h-[148px]' : 'h-[136px]'

  return (
    <Link
      className="group block h-full rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-subtle)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-focus)] hover:shadow-md focus-visible:border-[var(--color-focus)]"
      href={`/${locale}/c/${category.slug}`}
    >
      <article className="flex h-full min-h-[310px] flex-col p-5">
        <div className={`flex items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[#f7f9fc] ${imageHeightClass}`}>
          <Image
            alt={category.image?.alt || `Catégorie ${category.name}`}
            className="h-[158px] w-[158px] scale-[1.28] object-contain"
            height={180}
            sizes="158px"
            src={imageSrc}
            width={180}
          />
        </div>

        <div className="mt-4 flex grow flex-col">
          <div className="h-1 w-11 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />

          <div className="mt-3.5 space-y-2">
            <h3 className="line-clamp-2 text-lg font-bold leading-[1.25] text-[var(--color-text)] lg:text-xl">
              {category.name}
            </h3>

            {category.shortDescription ? (
              <p className="line-clamp-2 text-[15px] leading-[1.48] text-[var(--color-text-muted)] lg:text-base">
                {category.shortDescription}
              </p>
            ) : null}

            {typeof category.productCount === 'number' ? (
              <p className="text-sm font-medium text-[var(--color-text-muted)]">{category.productCount} produits</p>
            ) : null}
          </div>

          {isDetailed && category.children && category.children.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]" aria-label={`Sous-catégories de ${category.name}`}>
              {category.children.map((child) => (
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-slate-50 px-2 py-1" key={String(child.id)}>
                  {child.name}
                </li>
              ))}
            </ul>
          ) : null}

          <span className="mt-auto inline-flex min-h-8 items-center pt-3 text-base font-semibold text-[var(--color-focus)]">
            Découvrir <span className="ms-1 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </span>
        </div>
      </article>
    </Link>
  )
}
