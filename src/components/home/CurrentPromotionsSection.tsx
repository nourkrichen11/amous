import Image from 'next/image'
import Link from 'next/link'

import { formatTND } from '@/lib/formatting/currency'
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
    <HomepageSectionShell actionHref={`/${locale}/boutique?promotion=1`} title="Promotions du moment">
      <div className={`grid gap-4 ${products.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {products.slice(0, 2).map((product) => {
          const image = product.images[0]
          const hasDiscount = typeof product.previousPrice === 'number' && product.previousPrice > product.publicPrice
          const discountPercent = hasDiscount
            ? Math.round((((product.previousPrice ?? product.publicPrice) - product.publicPrice) / (product.previousPrice ?? product.publicPrice)) * 100)
            : 0

          return (
            <Link
              className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)]"
              href={`/${locale}/p/${product.slug}`}
              key={String(product.id)}
            >
              <div className="grid min-h-[260px] md:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[200px] overflow-hidden bg-slate-100">
                  <Image
                    alt={image?.alt || product.name}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    src={image?.url || '/placeholders/product.svg'}
                  />
                </div>
                <div className="flex flex-col justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Offre speciale</p>
                    <h3 className="mt-2 text-xl font-bold leading-tight text-[var(--color-text)]">{product.name}</h3>
                    {product.brand ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{product.brand.name}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-2xl font-bold text-[var(--color-text)]">{formatTND(product.publicPrice / 1000, locale)}</p>
                    {hasDiscount ? <p className="text-sm text-[var(--color-text-muted)] line-through">{formatTND((product.previousPrice ?? 0) / 1000, locale)}</p> : null}
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
