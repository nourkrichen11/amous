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

  return (
    <Link
      className="group block h-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-subtle)] transition hover:-translate-y-0.5 hover:border-[var(--color-focus)] hover:shadow-md focus-visible:border-[var(--color-focus)]"
      href={`/${locale}/c/${category.slug}`}
    >
      <article className="flex h-full flex-col p-3 sm:p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-slate-50">
          <Image
            alt={category.image?.alt || `Catégorie ${category.name}`}
            className="p-4 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={imageSrc}
          />
        </div>

        <div className="mt-4 flex grow flex-col">
          <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />

          <div className="mt-3 space-y-2">
            <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-[var(--color-text)] sm:text-lg sm:leading-7">
              {category.name}
            </h3>

            {category.shortDescription ? (
              <p className={`text-sm leading-6 text-[var(--color-text-muted)] ${isDetailed ? 'line-clamp-3' : 'line-clamp-2'}`}>
                {category.shortDescription}
              </p>
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

          <span className="mt-auto inline-flex min-h-[44px] items-center pt-3 text-sm font-semibold text-[var(--color-focus)]">
            Découvrir →
          </span>
        </div>
      </article>
    </Link>
  )
}
