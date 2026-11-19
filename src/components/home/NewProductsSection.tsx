import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomeProductGrid } from './HomeProductGrid'
import { HomepageSectionShell } from './HomepageSectionShell'

type NewProductsSectionProps = {
  locale: Locale
  products: ProductItem[]
}

export function NewProductsSection({ locale, products }: NewProductsSectionProps) {
  return (
    <HomepageSectionShell
      actionHref={`/${locale}/boutique?sort=new`}
      id="nouveautes"
      subtitle="Découvrez les derniers produits ajoutés à notre catalogue."
      title="Nouveautés"
    >
      {products.length > 0 ? (
        <HomeProductGrid highlightAsNew locale={locale} products={products} />
      ) : (
        <EmptyState actionHref={`/${locale}/boutique?sort=new`} actionLabel="Voir la boutique" description="Les derniers produits ajoutés apparaîtront ici." title="Aucune nouveauté disponible" />
      )}
    </HomepageSectionShell>
  )
}
