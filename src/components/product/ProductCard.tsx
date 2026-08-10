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
  locale: Locale
  product: ProductItem
  sourcePath?: string
}

export function ProductCard({ highlightAsNew = false, locale, product, sourcePath }: ProductCardProps) {
  const hasDiscount = typeof product.previousPrice === 'number' && product.previousPrice > product.publicPrice
  const discountPercent = hasDiscount
    ? Math.round((((product.previousPrice ?? product.publicPrice) - product.publicPrice) / (product.previousPrice ?? product.publicPrice)) * 100)
    : 0

  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-subtle)]">
      <Link href={`/${locale}/p/${product.slug}`}>
        <ProductImage image={product.images[0]} name={product.name} />
      </Link>
      <div className="mt-3 flex flex-wrap gap-1">
        {product.featured ? <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{t(locale, 'product.featured')}</span> : null}
        {product.newProduct || highlightAsNew ? <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{t(locale, 'product.new')}</span> : null}
        {product.promotionalProduct ? (
          <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{t(locale, 'product.promotion')}</span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        {product.brand ? <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{product.brand.name}</p> : null}
        <h2 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug">
          <Link className="hover:text-[var(--color-primary)]" href={`/${locale}/p/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {t(locale, 'product.sku')} <span dir="ltr">{product.sku}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold">{formatTND(product.publicPrice / 1000, locale)}</p>
            {hasDiscount ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm text-[var(--color-text-muted)] line-through">{formatTND((product.previousPrice ?? 0) / 1000, locale)}</p>
                <span className="text-xs font-semibold text-[var(--color-primary)]">-{discountPercent}%</span>
              </div>
            ) : null}
            <p className="text-xs text-[var(--color-text-muted)]">{product.unit}</p>
          </div>
          <StockBadge locale={locale} status={product.stockStatus} />
        </div>
        <AddToCartForm className="mt-2 grid gap-2" locale={locale} product={product} sourcePath={sourcePath || `/${locale}/boutique`} />
      </div>
    </article>
  )
}
