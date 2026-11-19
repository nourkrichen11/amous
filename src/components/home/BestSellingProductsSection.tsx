import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomeProductGrid } from './HomeProductGrid'
import { HomepageSectionShell } from './HomepageSectionShell'

type BestSellingProductsSectionProps = {
  locale: Locale
  products: ProductItem[]
}

export function BestSellingProductsSection({ locale, products }: BestSellingProductsSectionProps) {
  return (
    <HomepageSectionShell
      actionHref={`/${locale}/boutique`}
      id="meilleures-ventes"
      subtitle="Les produits les plus appréciés par nos clients."
      title="Meilleures ventes"
    >
      {products.length > 0 ? (
        <HomeProductGrid locale={locale} products={products} />
      ) : (
        <EmptyState actionHref={`/${locale}/boutique`} actionLabel="Voir la boutique" description="Les meilleures ventes apparaîtront ici dès qu'elles seront disponibles." title="Aucun produit mis en avant" />
      )}
    </HomepageSectionShell>
  )
}
