import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomepageSectionShell } from './HomepageSectionShell'

type NewProductsSectionProps = {
  locale: Locale
  products: ProductItem[]
}

export function NewProductsSection({ locale, products }: NewProductsSectionProps) {
  return (
    <HomepageSectionShell
      actionHref={`/${locale}/boutique?sort=new`}
      subtitle="Decouvrez les derniers produits ajoutes a notre catalogue."
      title="Nouveautes"
    >
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard highlightAsNew key={String(product.id)} locale={locale} product={product} sourcePath={`/${locale}`} />
          ))}
        </div>
      ) : (
        <EmptyState actionHref={`/${locale}/boutique?sort=new`} actionLabel="Voir la boutique" description="Les derniers produits ajoutes apparaitront ici." title="Aucune nouveaute disponible" />
      )}
    </HomepageSectionShell>
  )
}
