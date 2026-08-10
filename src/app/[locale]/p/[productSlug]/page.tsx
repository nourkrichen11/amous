import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ProductImage } from '@/components/product/ProductImage'
import { ProductGrid } from '@/components/product/ProductGrid'
import { StockBadge } from '@/components/product/StockBadge'
import { AddToCartForm } from '@/components/cart/AddToCartForm'
import { getProductBySlug, getProducts, getSiteSettings } from '@/features/catalogue/data'
import { formatTND } from '@/lib/formatting/currency'
import { getPublicSiteUrl } from '@/lib/env'
import { isLocale, t } from '@/i18n/config'

type ProductPageProps = {
  params: Promise<{ locale: string; productSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale: rawLocale, productSlug } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const product = await getProductBySlug(locale, productSlug)

  if (!product) {
    return {}
  }

  return {
    alternates: {
      canonical: `/${locale}/p/${product.slug}`,
      languages: {
        ar: `/ar/p/${product.slug}`,
        fr: `/fr/p/${product.slug}`
      }
    },
    description: product.seoDescription || product.shortDescription,
    title: product.seoTitle || product.name
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale: rawLocale, productSlug } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const product = await getProductBySlug(locale, productSlug)

  if (!product) {
    notFound()
  }

  const [settings, related] = await Promise.all([
    getSiteSettings(locale),
    product.category
      ? getProducts({
          categoryId: product.category.id,
          locale,
          page: 1
        })
      : Promise.resolve({ page: 1, products: [], totalDocs: 0, totalPages: 0 })
  ])

  const currentUrl = `${getPublicSiteUrl()}/${locale}/p/${product.slug}`
  const whatsappText = encodeURIComponent(`${product.name}\nSKU: ${product.sku}\n${currentUrl}`)
  const whatsappHref = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${whatsappText}` : undefined
  const hasDiscount = typeof product.previousPrice === 'number' && product.previousPrice > product.publicPrice
  const relatedProducts = related.products.filter((item) => item.id !== product.id).slice(0, 4)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    brand: product.brand?.name,
    image: product.images[0]?.url ? [product.images[0].url] : undefined,
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability: product.stockStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      price: product.publicPrice / 1000,
      priceCurrency: 'TND',
      url: currentUrl
    },
    sku: product.sku
  }

  return (
    <main className="container-page py-8" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Breadcrumbs
        items={[
          { href: `/${locale}/boutique`, label: t(locale, 'navigation.shop') },
          ...(product.category ? [{ href: `/${locale}/c/${product.category.slug}`, label: product.category.name }] : []),
          { label: product.name }
        ]}
        locale={locale}
      />
      <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <ProductImage image={product.images[0]} name={product.name} priority />
          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image) => (
                <ProductImage image={image} key={String(image.id)} name={product.name} />
              ))}
            </div>
          ) : null}
        </div>
        <aside className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-subtle)] lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-1">
            {product.featured ? <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{t(locale, 'product.featured')}</span> : null}
            {product.newProduct ? <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{t(locale, 'product.new')}</span> : null}
            {product.promotionalProduct ? <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{t(locale, 'product.promotion')}</span> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
          {product.brand ? <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">{product.brand.name}</p> : null}
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {t(locale, 'product.sku')} <span dir="ltr">{product.sku}</span>
          </p>
          {product.shortDescription ? <p className="mt-4 text-[var(--color-text-muted)]">{product.shortDescription}</p> : null}
          <div className="mt-5">
            <p className="text-3xl font-bold">{formatTND(product.publicPrice / 1000, locale)}</p>
            {hasDiscount ? <p className="text-sm text-[var(--color-text-muted)] line-through">{formatTND((product.previousPrice ?? 0) / 1000, locale)}</p> : null}
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {t(locale, 'product.vat')} · {t(locale, 'product.unit')}: {product.unit}
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <StockBadge locale={locale} status={product.stockStatus} />
            <span className="text-sm text-[var(--color-text-muted)]">{product.stockQuantity}</span>
          </div>
          <AddToCartForm className="mt-5 grid gap-3" locale={locale} product={product} quantityInput sourcePath={`/${locale}/p/${product.slug}`} />
          {whatsappHref ? (
            <Link className="mt-3 inline-flex w-full min-h-[var(--touch-target)] items-center justify-center rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" href={whatsappHref}>
              {t(locale, 'product.whatsappInquiry')}
            </Link>
          ) : null}
        </aside>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold">{t(locale, 'product.description')}</h2>
          <p className="mt-3 whitespace-pre-line text-[var(--color-text-muted)]">{product.fullDescription || product.shortDescription}</p>
        </div>
        {product.technicalAttributes.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold">{t(locale, 'product.technicalAttributes')}</h2>
            <dl className="mt-3 divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)] bg-white">
              {product.technicalAttributes.map((attribute) => (
                <div className="grid grid-cols-2 gap-4 p-3" key={`${attribute.label}-${attribute.value}`}>
                  <dt className="font-semibold">{attribute.label}</dt>
                  <dd className="text-[var(--color-text-muted)]">
                    {attribute.value} {attribute.unit}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>
      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t(locale, 'product.relatedProducts')}</h2>
          <div className="mt-5">
            <ProductGrid locale={locale} products={relatedProducts} />
          </div>
        </section>
      ) : null}
    </main>
  )
}
