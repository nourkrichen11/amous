import type { Metadata } from 'next'

import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { Pagination } from '@/components/catalogue/Pagination'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { getBrands, getCategories, getProducts } from '@/features/catalogue/data'
import { normalizeSearchParams, parseMillimePrice, parsePage } from '@/features/catalogue/searchParams'
import { formatNumber } from '@/lib/formatting/currency'
import { isLocale, t } from '@/i18n/config'

type ShopPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  return {
    alternates: {
      canonical: `/${locale}/boutique`,
      languages: { ar: '/ar/boutique', fr: '/fr/boutique' }
    },
    title: t(locale, 'navigation.shop')
  }
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const resolvedParams = normalizeSearchParams(await searchParams)
  const [categories, brands] = await Promise.all([getCategories(locale), getBrands(locale)])
  const selectedCategory = resolvedParams.category ? categories.find((category) => category.slug === resolvedParams.category) : undefined
  const listing = await getProducts({
    brandSlug: resolvedParams.brand,
    categoryId: selectedCategory?.id,
    inStock: resolvedParams.inStock === '1',
    locale,
    maxPrice: parseMillimePrice(resolvedParams.maxPrice),
    minPrice: parseMillimePrice(resolvedParams.minPrice),
    page: parsePage(resolvedParams.page),
    promotion: resolvedParams.promotion === '1',
    sort: resolvedParams.sort
  })

  return (
    <main className="container-page py-8" id="main-content">
      <Breadcrumbs items={[{ label: t(locale, 'navigation.shop') }]} locale={locale} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t(locale, 'navigation.shop')}</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">{t(locale, 'catalogue.productsCount', { count: formatNumber(listing.totalDocs, locale) })}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside>
          <CatalogueFilters brands={brands} categories={categories} locale={locale} params={resolvedParams} path={`/${locale}/boutique`} />
        </aside>
        <section>
          {listing.products.length > 0 ? (
            <>
              <ProductGrid locale={locale} products={listing.products} />
              <Pagination page={listing.page} pathname={`/${locale}/boutique`} searchParams={resolvedParams} totalPages={listing.totalPages} />
            </>
          ) : (
            <EmptyState actionHref={`/${locale}/boutique`} actionLabel={t(locale, 'catalogue.reset')} title={t(locale, 'catalogue.empty')} />
          )}
        </section>
      </div>
    </main>
  )
}
