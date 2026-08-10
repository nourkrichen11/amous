import type { Locale } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'
import { ProductCard } from '@/components/product/ProductCard'

type ProductGridProps = {
  locale: Locale
  products: ProductItem[]
}

export function ProductGrid({ locale, products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={String(product.id)} locale={locale} product={product} />
      ))}
    </div>
  )
}
