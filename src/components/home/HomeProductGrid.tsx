import { ProductCard } from '@/components/product/ProductCard'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

type HomeProductGridProps = {
  highlightAsNew?: boolean
  limit?: number
  locale: Locale
  products: ProductItem[]
}

/**
 * Fixed-column grid shared by the homepage product sections.
 * Columns are defined per breakpoint (not auto-fit), so a collection with one or
 * two products keeps normal card widths instead of stretching across the row.
 */
export function HomeProductGrid({ highlightAsNew = false, limit = 8, locale, products }: HomeProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4" role="list">
      {products.slice(0, limit).map((product) => (
        <li className="min-w-0" key={String(product.id)}>
          <ProductCard headingLevel="h3" highlightAsNew={highlightAsNew} locale={locale} product={product} sourcePath={`/${locale}`} />
        </li>
      ))}
    </ul>
  )
}
