import type { Locale } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'
import { ProductCard } from '@/components/product/ProductCard'

type ProductGridProps = {
  headingLevel?: 'h2' | 'h3'
  locale: Locale
  products: ProductItem[]
  sourcePath?: string
  view?: 'grid' | 'list'
}

/**
 * Columns follow the width of the results area (container queries), not the viewport,
 * so the grid adapts to the filter sidebar: 1 → 2 → 3 → 4 columns. Columns are fixed per
 * width, so one or two products keep a normal card width instead of stretching.
 */
export const PRODUCT_GRID_CLASS = 'grid grid-cols-1 gap-3 @[21rem]:grid-cols-2 @[44rem]:grid-cols-3 @[58rem]:grid-cols-4 sm:gap-4'

export function ProductGrid({ headingLevel, locale, products, sourcePath, view = 'grid' }: ProductGridProps) {
  return (
    <div className="@container">
      <ul className={view === 'list' ? 'grid grid-cols-1 gap-3 sm:gap-4' : PRODUCT_GRID_CLASS} role="list">
        {products.map((product) => (
          <li className="min-w-0" key={String(product.id)}>
            <ProductCard headingLevel={headingLevel} layout={view} locale={locale} product={product} sourcePath={sourcePath} />
          </li>
        ))}
      </ul>
    </div>
  )
}
