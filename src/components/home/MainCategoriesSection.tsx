import { CategoryCard } from '@/components/category/CategoryCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CategoryItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomepageSectionShell } from './HomepageSectionShell'

type MainCategoriesSectionProps = {
  categories: CategoryItem[]
  locale: Locale
}

export function MainCategoriesSection({ categories, locale }: MainCategoriesSectionProps) {
  return (
    <HomepageSectionShell
      actionHref={`/${locale}/nos-categories`}
      actionLabel="Toutes les catégories"
      id="categories"
      subtitle="Trouvez rapidement tout ce dont vous avez besoin pour vos travaux."
      title="Explorez nos catégories"
    >
      {categories.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4" role="list">
          {categories.slice(0, 8).map((category) => (
            <li className="min-w-0" key={String(category.id)}>
              <CategoryCard category={category} locale={locale} variant="compact" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState actionHref={`/${locale}/nos-categories`} actionLabel="Voir les catégories" description="Aucune catégorie n'est disponible pour le moment." title="Catégories à venir" />
      )}
    </HomepageSectionShell>
  )
}
