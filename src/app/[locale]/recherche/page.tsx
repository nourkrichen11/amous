import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { searchProducts } from '@/features/catalogue/data'
import { normalizeSearchParams } from '@/features/catalogue/searchParams'
import { formatNumber } from '@/lib/formatting/currency'
import { isLocale, t } from '@/i18n/config'

type SearchPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  return {
    robots: {
      follow: false,
      index: false
    },
    title: t(locale, 'search.title')
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const resolvedParams = normalizeSearchParams(await searchParams)
  const query = (resolvedParams.q || '').trim().slice(0, 80)
  const products = await searchProducts(locale, query)

  return (
    <main className="container-page py-8" id="main-content">
      <Breadcrumbs items={[{ label: t(locale, 'search.title') }]} locale={locale} />
      <h1 className="mt-6 text-3xl font-bold">{query ? t(locale, 'search.resultsFor', { query }) : t(locale, 'search.title')}</h1>
      <form action={`/${locale}/recherche`} className="mt-6 flex max-w-2xl gap-2">
        <label className="sr-only" htmlFor="search-page-input">
          {t(locale, 'search.title')}
        </label>
        <input
          className="min-h-[var(--touch-target)] flex-1 rounded-md border border-[var(--color-border)] px-3"
          defaultValue={query}
          id="search-page-input"
          name="q"
          placeholder={t(locale, 'search.placeholder')}
          type="search"
        />
        <button className="rounded-md bg-[var(--color-primary)] px-5 font-semibold text-white" type="submit">
          {t(locale, 'navigation.search')}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t(locale, 'catalogue.productsCount', { count: formatNumber(products.length, locale) })}</p>
      <div className="mt-6">
        {products.length > 0 ? (
          <ProductGrid locale={locale} products={products} />
        ) : (
          <EmptyState actionHref={`/${locale}/boutique`} actionLabel={t(locale, 'navigation.shop')} title={query ? t(locale, 'search.empty') : t(locale, 'search.title')} />
        )}
      </div>
    </main>
  )
}
