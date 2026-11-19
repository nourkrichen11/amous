import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

import { CartStatusNotice } from '@/components/cart/CartStatusNotice'
import { CatalogueFilters, type CatalogueFiltersProps } from '@/components/catalogue/CatalogueFilters'
import { CatalogueToolbar } from '@/components/catalogue/CatalogueToolbar'
import { CategorySearch } from '@/components/catalogue/CategorySearch'
import { Pagination } from '@/components/catalogue/Pagination'
import { CategoryCard } from '@/components/category/CategoryCard'
import { CategoryHeader } from '@/components/category/CategoryHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getClearFiltersHref, getActiveFilters } from '@/features/catalogue/activeFilters'
import {
  getActiveSubcategories,
  getBrands,
  getCategoryBySlug,
  getCategoryListingFacets,
  getProducts,
  getRelatedCategories
} from '@/features/catalogue/data'
import { CATEGORY_DEFAULT_PAGE_SIZE, CATEGORY_DEFAULT_SORT, CATEGORY_SORT_OPTIONS, buildListingQuery } from '@/features/catalogue/listingQuery'
import { normalizeSearchParams, withoutTransientParams } from '@/features/catalogue/searchParams'
import { buildCatalogueHref } from '@/features/catalogue/url'
import { isLocale, t } from '@/i18n/config'

type CategoryPageProps = {
  params: Promise<{ categorySlug: string; locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

const SORT_VALUES = CATEGORY_SORT_OPTIONS.map((option) => option.value)

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug, locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const category = await getCategoryBySlug(locale, categorySlug)

  if (!category) {
    return {}
  }

  return {
    alternates: {
      canonical: `/${locale}/c/${category.slug}`,
      languages: {
        ar: `/ar/c/${category.slug}`,
        fr: `/fr/c/${category.slug}`
      }
    },
    description: category.seo?.metaDescription || category.shortDescription,
    openGraph: {
      description: category.seo?.metaDescription || category.shortDescription,
      images: category.image?.url ? [category.image.url] : [],
      title: category.seo?.metaTitle || category.name
    },
    robots: category.seo?.noIndex ? { index: false, follow: false } : undefined,
    title: category.seo?.metaTitle || category.name
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug, locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const category = await getCategoryBySlug(locale, categorySlug)

  if (!category) {
    notFound()
  }

  const path = `/${locale}/c/${category.slug}`
  const rawParams = normalizeSearchParams(await searchParams)
  const listingParams = withoutTransientParams(rawParams)
  const subcategories = await getActiveSubcategories(locale, category.id)
  const scopeIds = [category.id, ...subcategories.map((child) => child.id)]
  const selectedSub = subcategories.find((child) => child.slug === listingParams.sub)

  const query = buildListingQuery(listingParams, {
    categoryIds: selectedSub ? [selectedSub.id] : scopeIds,
    defaultPageSize: CATEGORY_DEFAULT_PAGE_SIZE,
    defaultSort: CATEGORY_DEFAULT_SORT,
    locale,
    searchScope: 'nameAndReference',
    sortOptions: SORT_VALUES
  })

  const [brands, facets, listing, relatedCategories] = await Promise.all([
    getBrands(locale),
    getCategoryListingFacets(locale, scopeIds),
    getProducts(query),
    getRelatedCategories(locale, category)
  ])

  const categoryTotal = facets.stock.in_stock + facets.stock.low_stock + facets.stock.out_of_stock
  const availableSubcategories = subcategories.filter((child) => (facets.categoryCounts[String(child.id)] ?? 0) > 0 || child.slug === listingParams.sub)
  const activeFilters = getActiveFilters({ brands, params: listingParams, path, subcategories })
  const clearHref = getClearFiltersHref(path, listingParams)
  const hasFilters = activeFilters.some((filter) => filter.key !== 'q')
  const searchTerm = listingParams.q?.trim()
  const pageSize = query.pageSize ?? CATEGORY_DEFAULT_PAGE_SIZE
  const sourcePath = buildCatalogueHref(path, listingParams, { page: listingParams.page })

  const filterProps: Omit<CatalogueFiltersProps, 'variant'> = {
    brands: facets.brands,
    clearHref,
    locale,
    params: listingParams,
    path,
    priceBounds: facets.price,
    showOffers: false,
    stockCounts: facets.stock,
    subcategories: availableSubcategories,
    totalDocs: listing.totalDocs
  }

  const breadcrumbs = [
    { href: `/${locale}/nos-categories`, label: 'Nos catégories' },
    ...(category.parent ? [{ href: `/${locale}/c/${category.parent.slug}`, label: category.parent.name }] : []),
    { label: category.name }
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `/${locale}`, name: t(locale, 'navigation.home'), position: 1 },
      ...breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        item: item.href ?? path,
        name: item.label,
        position: index + 2
      }))
    ]
  }

  let results: ReactNode
  if (listing.products.length > 0) {
    results = (
      <>
        <ProductGrid locale={locale} products={listing.products} sourcePath={sourcePath} view={listingParams.view === 'list' ? 'list' : 'grid'} />
        <Pagination page={listing.page} pathname={path} searchParams={listingParams} totalPages={listing.totalPages} />
      </>
    )
  } else if (listing.totalDocs > 0) {
    results = (
      <NoResults
        actions={[{ href: buildCatalogueHref(path, listingParams, {}), label: 'Revenir à la première page', primary: true }]}
        description="La page demandée n'existe pas pour cette sélection."
        title="Cette page est vide"
      />
    )
  } else if (searchTerm) {
    results = (
      <NoResults
        actions={[
          { href: buildCatalogueHref(path, listingParams, { q: null }), label: 'Effacer la recherche', primary: true },
          ...(hasFilters ? [{ href: clearHref, label: 'Tout effacer' }] : [])
        ]}
        description={`Aucun produit de la catégorie « ${category.name} » ne correspond à « ${searchTerm} »${hasFilters ? ' avec les filtres actifs' : ''}. Vérifiez l’orthographe ou essayez une référence.`}
        title="Aucun résultat"
      />
    )
  } else if (hasFilters) {
    results = <NoResults actions={[{ href: clearHref, label: 'Tout effacer', primary: true }]} description="Essayez de retirer un ou plusieurs filtres." title="Aucun produit ne correspond à vos filtres" />
  } else {
    results = (
      <NoResults
        actions={[
          { href: `/${locale}/boutique`, label: 'Voir la boutique', primary: true },
          { href: `/${locale}/nos-categories`, label: 'Toutes les catégories' }
        ]}
        description="Aucun produit n’est encore disponible dans cette catégorie."
        title="Bientôt disponible"
      />
    )
  }

  return (
    <main className="bg-[var(--color-background)] pb-4" id="main-content">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <CategoryHeader breadcrumbs={breadcrumbs} category={category} locale={locale} productCount={categoryTotal} />

      <div className="container-catalog mt-5 grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside aria-label="Filtres des produits" className="hidden lg:block">
          {categoryTotal > 0 ? <CatalogueFilters {...filterProps} variant="desktop" /> : null}
        </aside>

        <section aria-label={`Produits : ${category.name}`} className="min-w-0">
          <CartStatusNotice locale={locale} params={rawParams} />

          {categoryTotal > 0 ? (
            <>
              <div className="mb-3">
                <CategorySearch categoryName={category.name} key={listingParams.q ?? ''} params={listingParams} path={path} />
              </div>
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
            </>
          ) : null}

          {results}
        </section>
      </div>

      {relatedCategories.length > 0 ? (
        <section aria-labelledby="related-categories-title" className="container-catalog mt-12">
          <h2 className="text-lg font-bold text-[var(--color-navy)] sm:text-xl" id="related-categories-title">
            Catégories liées
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" role="list">
            {relatedCategories.map((relatedCategory) => (
              <li className="min-w-0" key={String(relatedCategory.id)}>
                <CategoryCard category={relatedCategory} locale={locale} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
