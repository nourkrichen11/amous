import Image from 'next/image'
import Link from 'next/link'

import { ProductImageFallback } from '@/components/product/ProductImage'
import { formatTNDMillimes } from '@/lib/formatting/currency'
import { getDiscountPercent } from '@/features/catalogue/pricing'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomepageSectionShell } from './HomepageSectionShell'

type CurrentPromotionsSectionProps = {
  locale: Locale
  products: ProductItem[]
}

export function CurrentPromotionsSection({ locale, products }: CurrentPromotionsSectionProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <HomepageSectionShell actionHref={`/${locale}/boutique?promotion=1`} id="promotions" title="Promotions du moment">
      <div className={`grid gap-4 ${products.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {products.slice(0, 2).map((product) => {
          const image = product.images[0]
          const discountPercent = getDiscountPercent(product)
          const hasDiscount = discountPercent > 0

          return (
            <Link
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[var(--shadow-hover)]"
              href={`/${locale}/p/${product.slug}`}
              key={String(product.id)}
            >
              <div className="grid min-h-[260px] md:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[200px] overflow-hidden bg-[var(--color-image-well)]">
                  {image?.url ? (
                    <Image
                      alt={image.alt || product.name}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      src={image.url}
                    />
                  ) : (
                    <ProductImageFallback className="absolute inset-0" name={product.name} />
                  )}
                </div>
                <div className="flex flex-col justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Offre spéciale</p>
                    <h3 className="mt-2 text-xl font-bold leading-tight text-[var(--color-navy)]">{product.name}</h3>
                    {product.brand ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{product.brand.name}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-2xl font-bold text-[var(--color-text)]">{formatTNDMillimes(product.publicPrice, locale)}</p>
                    {hasDiscount ? <p className="text-sm text-[var(--color-text-muted)] line-through">{formatTNDMillimes(product.previousPrice ?? 0, locale)}</p> : null}
                    {hasDiscount ? <span className="rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_12%,white_88%)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">-{discountPercent}%</span> : null}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </HomepageSectionShell>
  )
}
