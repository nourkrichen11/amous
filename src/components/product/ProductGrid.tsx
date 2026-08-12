import type { Locale } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'
import { ProductCard } from '@/components/product/ProductCard'

type ProductGridProps = {
  locale: Locale
  products: ProductItem[]
  sourcePath?: string
  view?: 'grid' | 'list'
}

export function ProductGrid({ locale, products, sourcePath, view = 'grid' }: ProductGridProps) {
  return (
    <div className={view === 'list' ? 'grid grid-cols-1 gap-4' : 'product-grid'}>
      {products.map((product) => (
        <ProductCard key={String(product.id)} layout={view} locale={locale} product={product} sourcePath={sourcePath} />
      ))}
    </div>
  )
}
