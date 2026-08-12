import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'
import { formatTND } from '@/lib/formatting/currency'
import { ProductImage } from '@/components/product/ProductImage'
import { StockBadge } from '@/components/product/StockBadge'
import { AddToCartForm } from '@/components/cart/AddToCartForm'

type ProductCardProps = {
  highlightAsNew?: boolean
  layout?: 'grid' | 'list'
  locale: Locale
  product: ProductItem
  sourcePath?: string
}

export function ProductCard({ highlightAsNew = false, layout = 'grid', locale, product, sourcePath }: ProductCardProps) {
  const hasDiscount = typeof product.previousPrice === 'number' && product.previousPrice > product.publicPrice
  const discountPercent = hasDiscount
    ? Math.round((((product.previousPrice ?? product.publicPrice) - product.publicPrice) / (product.previousPrice ?? product.publicPrice)) * 100)
    : 0

  return (
    <article className={`group relative flex h-full min-w-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-subtle)] transition-shadow hover:shadow-[0_8px_24px_rgb(15_23_42/0.09)] ${layout === 'list' ? 'md:flex-row' : 'flex-col'}`}>
      <div className={`relative shrink-0 p-3 pb-0 ${layout === 'list' ? 'md:w-[230px] md:p-4 md:pe-0' : ''}`}>
        <Link className="block" href={`/${locale}/p/${product.slug}`}>
          <ProductImage image={product.images[0]} name={product.name} sizes={layout === 'list' ? '(max-width: 767px) 100vw, 230px' : undefined} />
        </Link>
        <div className="absolute start-5 top-5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-1.5">
          {product.promotionalProduct && hasDiscount ? <span className="rounded bg-[var(--color-primary)] px-2 py-1 text-[11px] font-bold text-white">-{discountPercent}%</span> : null}
          {product.newProduct || highlightAsNew ? <span className="rounded bg-[#1d4ed8] px-2 py-1 text-[11px] font-bold text-white">{t(locale, 'product.new')}</span> : null}
          {!product.promotionalProduct && product.featured ? <span className="rounded bg-[#17233b] px-2 py-1 text-[11px] font-bold text-white">{t(locale, 'product.featured')}</span> : null}
          {product.stockStatus === 'out_of_stock' ? <span className="rounded bg-slate-600 px-2 py-1 text-[11px] font-bold text-white">Rupture</span> : null}
        </div>
      </div>
      <div className={`flex min-w-0 flex-1 flex-col p-4 ${layout === 'list' ? 'md:p-5' : 'pt-3'}`}>
        {product.brand ? <p className="text-[11px] font-bold uppercase text-[#1d4ed8]">{product.brand.name}</p> : <span className="h-4" />}
        <h2 className={`mt-1 line-clamp-2 text-base font-bold leading-snug text-[#17233b] ${layout === 'grid' ? 'min-h-11' : ''}`}>
          <Link className="hover:text-[var(--color-primary)]" href={`/${locale}/p/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          {t(locale, 'product.sku')} <span dir="ltr">{product.sku}</span>
        </p>
        {layout === 'list' && product.shortDescription ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">{product.shortDescription}</p> : null}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xl font-black leading-tight text-[#111c34]">{formatTND(product.publicPrice / 1000, locale)}</p>
            {hasDiscount ? (
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)] line-through">{formatTND((product.previousPrice ?? 0) / 1000, locale)}</p>
            ) : null}
          </div>
          <StockBadge locale={locale} status={product.stockStatus} />
        </div>
        {product.stockStatus === 'out_of_stock' || product.stockQuantity < product.minimumOrderQuantity ? (
          <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-[#17233b] px-4 text-sm font-bold text-[#17233b] hover:bg-slate-50" href={`/${locale}/p/${product.slug}`}>
            Voir le produit
          </Link>
        ) : (
          <AddToCartForm className="mt-4 grid" locale={locale} product={product} sourcePath={sourcePath || `/${locale}/boutique`} />
        )}
      </div>
    </article>
  )
}
