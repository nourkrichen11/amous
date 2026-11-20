import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX } from 'lucide-react'
import { Suspense, type ReactNode } from 'react'

import { BrandHeader } from '@/components/brand/BrandHeader'
import { CartStatusNotice } from '@/components/cart/CartStatusNotice'
import { CatalogueFilters, type CatalogueFiltersProps } from '@/components/catalogue/CatalogueFilters'
import { CatalogueToolbar } from '@/components/catalogue/CatalogueToolbar'
import { Pagination } from '@/components/catalogue/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { getActiveFilters, getClearFiltersHref } from '@/features/catalogue/activeFilters'
import { getBrandBySlug, getListingFacets, getProducts, type CategoryListingFacets } from '@/features/catalogue/data'
import { CATEGORY_DEFAULT_PAGE_SIZE, CATEGORY_DEFAULT_SORT, CATEGORY_SORT_OPTIONS, buildListingQuery } from '@/features/catalogue/listingQuery'
import { normalizeSearchParams, withoutTransientParams } from '@/features/catalogue/searchParams'
import type { BrandItem } from '@/features/catalogue/types'
import { buildCatalogueHref } from '@/features/catalogue/url'
import { t, type Locale } from '@/i18n/config'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type BrandPageProps = {
  params: Promise<{ brandSlug: string; locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

const SORT_VALUES = CATEGORY_SORT_OPTIONS.map((option) => option.value)

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const locale = await resolveLocaleFromParams(params)
  const { brandSlug } = await params
  const brand = await getBrandBySlug(locale, decodeSlug(brandSlug))

  if (!brand) {
    return {}
  }

  const title = brand.seo?.title || t(locale, 'brands.brandMetaTitle', { name: brand.name })
  const description = brand.seo?.description || brand.description || t(locale, 'brands.brandMetaDescription', { name: brand.name })

  return {
    alternates: {
      canonical: `/${locale}/marques/${brand.slug}`,
      languages: { ar: `/ar/marques/${brand.slug}`, fr: `/fr/marques/${brand.slug}` }
    },
    description,
    openGraph: {
      description,
      images: brand.logo?.url ? [brand.logo.url] : [],
      title
    },
    title
  }
}

function NoResults({ actions, description, title }: { actions: Array<{ href: string; label: string; primary?: boolean }>; description: string; title: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white px-6 py-12 text-center">
      <SearchX aria-hidden="true" className="mx-auto text-slate-300" size={40} strokeWidth={1.5} />
      <h2 className="mt-3 text-lg font-bold text-[var(--color-navy)]">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {actions.map((action) => (
          <Link
            className={
              action.primary
                ? 'inline-flex min-h-[var(--touch-target)] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[#c70511]'
                : 'inline-flex min-h-[var(--touch-target)] items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-navy)] hover:border-[var(--color-navy)]'
            }
            href={action.href}
            key={action.href + action.label}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

type BrandListingProps = {
  brand: BrandItem
  brandTotal: number
  facets: CategoryListingFacets
  listingParams: Record<string, string | undefined>
  locale: Locale
  path: string
  rawParams: Record<string, string | undefined>
}

/** Product listing for a brand, streamed inside a Suspense boundary (uncached query). */
async function BrandListing({ brand, brandTotal, facets, listingParams, locale, path, rawParams }: BrandListingProps) {
  const query = buildListingQuery(listingParams, {
    brandIds: [brand.id],
    defaultPageSize: CATEGORY_DEFAULT_PAGE_SIZE,
    defaultSort: CATEGORY_DEFAULT_SORT,
    locale,
    sortOptions: SORT_VALUES
  })
  const listing = await getProducts(query)

  const activeFilters = getActiveFilters({ brands: [], params: listingParams, path })
  const clearHref = getClearFiltersHref(path, listingParams)
  const pageSize = query.pageSize ?? CATEGORY_DEFAULT_PAGE_SIZE
  const sourcePath = buildCatalogueHref(path, listingParams, { page: listingParams.page })
  const productsLabel = t(locale, 'brands.productsLabel', { name: brand.name })

  const filterProps: Omit<CatalogueFiltersProps, 'variant'> = {
    brands: [],
    clearHref,
    locale,
    params: listingParams,
    path,
    priceBounds: facets.price,
    showOffers: false,
    stockCounts: facets.stock,
    totalDocs: listing.totalDocs
  }

  let results: ReactNode
  if (listing.products.length > 0) {
    results = (
      <>
        <ProductGrid locale={locale} products={listing.products} sourcePath={sourcePath} view={listingParams.view === 'list' ? 'list' : 'grid'} />
        <Pagination page={listing.page} pathname={path} searchParams={listingParams} totalPages={listing.totalPages} />
      </>
    )
  } else if (brandTotal === 0) {
    results = (
      <NoResults
        actions={[
          { href: `/${locale}/boutique`, label: t(locale, 'brands.browseShop'), primary: true },
          { href: `/${locale}/marques`, label: t(locale, 'brands.allBrands') }
        ]}
        description={t(locale, 'brands.noProductsDescription', { name: brand.name })}
        title={t(locale, 'brands.noProductsTitle')}
      />
    )
  } else if (listing.totalDocs > 0) {
    results = (
      <NoResults
        actions={[{ href: buildCatalogueHref(path, listingParams, {}), label: t(locale, 'brands.firstPage'), primary: true }]}
        description={t(locale, 'brands.emptyPageDescription')}
        title={t(locale, 'brands.emptyPageTitle')}
      />
    )
  } else {
    results = (
      <NoResults
        actions={[{ href: clearHref, label: t(locale, 'brands.clearFilters'), primary: true }]}
        description={t(locale, 'brands.noMatchDescription')}
        title={t(locale, 'brands.noMatchTitle')}
      />
    )
  }

  return (
    <div className={`container-catalog mt-5 grid min-w-0 gap-6 ${brandTotal > 0 ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : ''}`}>
      {brandTotal > 0 ? (
        <aside aria-label={productsLabel} className="hidden lg:block">
          <CatalogueFilters {...filterProps} variant="desktop" />
        </aside>
      ) : null}

      <section aria-label={productsLabel} className="min-w-0">
        <CartStatusNotice locale={locale} params={rawParams} />

        {brandTotal > 0 ? (
          <CatalogueToolbar
            activeFilters={activeFilters}
            clearHref={clearHref}
            defaultPageSize={CATEGORY_DEFAULT_PAGE_SIZE}
            defaultSort={CATEGORY_DEFAULT_SORT}
            filterProps={filterProps}
            page={listing.page}
            pageSize={pageSize}
            params={listingParams}
            path={path}
            sortOptions={CATEGORY_SORT_OPTIONS}
            totalDocs={listing.totalDocs}
          />
        ) : null}

        {results}
      </section>
    </div>
  )
}

function BrandListingSkeleton() {
  return (
    <div className="container-catalog mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Skeleton className="hidden h-[360px] rounded-[var(--radius-lg)] lg:block" />
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const locale = await resolveLocaleFromParams(params)
  const { brandSlug } = await params
  const brand = await getBrandBySlug(locale, decodeSlug(brandSlug))

  // Resolved before anything streams, so unknown and inactive brands get a real 404 status.
  // Keep it that way: no route-level loading.tsx may wrap this page (see marques/(index)).
  if (!brand) {
    notFound()
  }

  const path = `/${locale}/marques/${brand.slug}`
  const rawParams = normalizeSearchParams(await searchParams)
  // The brand comes from the path and stays fixed: a `brand` query param is dropped, so it
  // can neither widen nor change the scope, and every derived link (sort, pages, chips,
  // "Tout effacer") keeps this path.
  const listingParams = Object.fromEntries(Object.entries(withoutTransientParams(rawParams)).filter(([key]) => key !== 'brand'))
  const facets = await getListingFacets(locale, { brandIds: [brand.id] })
  const brandTotal = facets.stock.in_stock + facets.stock.low_stock + facets.stock.out_of_stock
  const directoryLabel = t(locale, 'brands.title')

  const breadcrumbs = [{ href: `/${locale}/marques`, label: directoryLabel }, { label: brand.name }]
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `/${locale}`, name: t(locale, 'navigation.home'), position: 1 },
      { '@type': 'ListItem', item: `/${locale}/marques`, name: directoryLabel, position: 2 },
      { '@type': 'ListItem', item: path, name: brand.name, position: 3 }
    ]
  }

  return (
    <main className="bg-[var(--color-background)] pb-4" id="main-content">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <BrandHeader brand={brand} breadcrumbs={breadcrumbs} locale={locale} productCount={brandTotal} />

      <Suspense fallback={<BrandListingSkeleton />} key={JSON.stringify(listingParams)}>
        <BrandListing brand={brand} brandTotal={brandTotal} facets={facets} listingParams={listingParams} locale={locale} path={path} rawParams={rawParams} />
      </Suspense>
    </main>
  )
}
