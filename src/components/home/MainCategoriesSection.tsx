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
      actionLabel="Voir toutes les categories"
      subtitle="Trouvez rapidement tout ce dont vous avez besoin pour vos travaux."
      title="Explorez nos categories"
    >
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard category={category} key={String(category.id)} locale={locale} variant="compact" />
          ))}
        </div>
      ) : (
        <EmptyState actionHref={`/${locale}/nos-categories`} actionLabel="Voir les categories" description="Aucune categorie n'est disponible pour le moment." title="Categories a venir" />
      )}
    </HomepageSectionShell>
  )
}
