import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'
import { getDiscountPercent } from '@/features/catalogue/pricing'
import { formatTNDMillimes } from '@/lib/formatting/currency'
import { cn } from '@/lib/utils/cn'
import { ProductImage } from '@/components/product/ProductImage'
import { StockBadge } from '@/components/product/StockBadge'
import { AddToCartForm } from '@/components/cart/AddToCartForm'

type ProductCardProps = {
  /** Heading level for the product title; use h3 when cards sit under a section h2. */
  headingLevel?: 'h2' | 'h3'
  highlightAsNew?: boolean
  layout?: 'grid' | 'list'
  locale: Locale
  product: ProductItem
  sourcePath?: string
}

const badgeBase = 'inline-flex h-6 items-center rounded-[var(--radius-sm)] px-2 text-[11px] font-bold uppercase tracking-wide'

export function ProductCard({ headingLevel = 'h2', highlightAsNew = false, layout = 'grid', locale, product, sourcePath }: ProductCardProps) {
  const isList = layout === 'list'
  const productHref = `/${locale}/p/${product.slug}`
  const discountPercent = getDiscountPercent(product)
  const hasDiscount = discountPercent > 0
  const isNew = Boolean(product.newProduct || highlightAsNew)
  const isOutOfStock = product.stockStatus === 'out_of_stock'
  const cannotAddToCart = isOutOfStock || product.stockQuantity < product.minimumOrderQuantity
  const Heading = headingLevel

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-subtle)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[var(--shadow-hover)]',
        isList ? 'flex-col md:flex-row' : 'flex-col'
      )}
    >
      <div className={cn('relative shrink-0 p-2.5 pb-0 sm:p-3 sm:pb-0', isList && 'md:w-[230px] md:p-4 md:pe-0')}>
        <Link aria-hidden="true" className="block" href={productHref} tabIndex={-1}>
          <ProductImage
            className={isOutOfStock ? 'opacity-60' : undefined}
            image={product.images[0]}
            name={product.name}
            sizes={isList ? '(max-width: 767px) 100vw, 230px' : undefined}
          />
        </Link>

        <div className="pointer-events-none absolute start-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-1 sm:start-5 sm:top-5">
          {hasDiscount ? (
            <span className={cn(badgeBase, 'bg-[var(--color-primary)] text-white')}>
              <span className="sr-only">Remise de </span>-{discountPercent}%
            </span>
          ) : null}
          {isNew ? <span className={cn(badgeBase, 'bg-[var(--color-navy)] text-white')}>{t(locale, 'product.new')}</span> : null}
          {!hasDiscount && !isNew && product.featured ? (
            <span className={cn(badgeBase, 'border border-[var(--color-navy)]/15 bg-white text-[var(--color-navy)]')}>{t(locale, 'product.featured')}</span>
          ) : null}
        </div>
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col p-3 pt-3 sm:p-4 sm:pt-3.5', isList && 'md:p-5')}>
        <p className="h-4 truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">{product.brand?.name ?? ''}</p>

        <Heading className={cn('mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-navy)] sm:text-[15px]', !isList && 'min-h-[2.5rem] sm:min-h-[2.6rem]')}>
          <Link className="hover:text-[var(--color-primary)] focus-visible:text-[var(--color-primary)]" href={productHref} title={product.name}>
            {product.name}
          </Link>
        </Heading>

        <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
          {t(locale, 'product.sku')} <span dir="ltr">{product.sku}</span>
        </p>

        {isList && product.shortDescription ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">{product.shortDescription}</p> : null}

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-lg font-extrabold leading-tight text-[var(--color-navy-strong)] sm:text-xl" dir="ltr">
              {formatTNDMillimes(product.publicPrice, locale)}
            </p>
            {hasDiscount ? (
              <p className="text-xs text-[var(--color-text-muted)] line-through" dir="ltr">
                <span className="sr-only">Prix précédent : </span>
                {formatTNDMillimes(product.previousPrice ?? 0, locale)}
              </p>
            ) : null}
          </div>

          <div className="mt-1.5">
            <StockBadge locale={locale} status={product.stockStatus} />
          </div>

          <div className={cn(isList && 'md:max-w-xs')}>
            {cannotAddToCart ? (
              <Link
                className="mt-3 inline-flex min-h-[var(--touch-target)] w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-navy)] px-3 text-sm font-semibold text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy-soft)]"
                href={productHref}
              >
                Voir le produit
              </Link>
            ) : (
              <AddToCartForm
                buttonClassName="w-full px-2 text-[13px] sm:px-4 sm:text-sm"
                className="mt-3 grid"
                locale={locale}
                product={product}
                sourcePath={sourcePath || `/${locale}/boutique`}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
