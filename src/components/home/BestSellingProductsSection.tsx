import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomepageSectionShell } from './HomepageSectionShell'

type BestSellingProductsSectionProps = {
  locale: Locale
  products: ProductItem[]
}

export function BestSellingProductsSection({ locale, products }: BestSellingProductsSectionProps) {
  return (
    <HomepageSectionShell
      actionHref={`/${locale}/boutique`}
      subtitle="Les produits les plus apprecies par nos clients."
      title="Meilleures ventes"
    >
      {products.length > 0 ? (
        <ProductGrid locale={locale} products={products.slice(0, 8)} />
      ) : (
        <EmptyState actionHref={`/${locale}/boutique`} actionLabel="Voir la boutique" description="Les meilleures ventes apparaitront ici des qu'elles seront disponibles." title="Aucun produit mis en avant" />
      )}
    </HomepageSectionShell>
  )
}
