import type { Metadata } from 'next'

import { CartStatusNotice } from '@/components/cart/CartStatusNotice'
import { CategoryRail } from '@/components/catalogue/CategoryRail'
import { CatalogueFilters, type CatalogueFiltersProps } from '@/components/catalogue/CatalogueFilters'
import { CatalogueToolbar } from '@/components/catalogue/CatalogueToolbar'
import { Pagination } from '@/components/catalogue/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { getActiveFilters, getClearFiltersHref } from '@/features/catalogue/activeFilters'
import { getAllParentCategories, getBrands, getProducts } from '@/features/catalogue/data'
import { buildListingQuery } from '@/features/catalogue/listingQuery'
import { normalizeSearchParams, withoutTransientParams } from '@/features/catalogue/searchParams'
import { buildCatalogueHref } from '@/features/catalogue/url'
import { isLocale } from '@/i18n/config'

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
    description: 'Découvrez tous les produits, outils et équipements AMOUS pour vos travaux professionnels et vos projets.',
    title: 'Boutique | AMOUS Quincaillerie'
  }
}

const SHOP_SORT_OPTIONS = [
  { label: 'Pertinence', value: 'relevance' },
  { label: 'Plus récents', value: 'new' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Nom (A–Z)', value: 'name' },
  { label: 'Promotions', value: 'promotions' }
] as const
const SHOP_DEFAULT_PAGE_SIZE = 12

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const path = `/${locale}/boutique`
  const rawParams = normalizeSearchParams(await searchParams)
  const resolvedParams = withoutTransientParams(rawParams)
  const [categories, brands] = await Promise.all([getAllParentCategories(locale), getBrands(locale)])
  const selectedCategory = categories.find((category) => category.slug === resolvedParams.category)
  const selectedSubcategory = selectedCategory?.children?.find((category) => category.slug === resolvedParams.subcategory)
  const categoryIds = selectedSubcategory
    ? [selectedSubcategory.id]
    : selectedCategory
      ? [selectedCategory.id, ...(selectedCategory.children?.map((category) => category.id) ?? [])]
      : undefined
  const query = buildListingQuery(resolvedParams, {
    categoryIds,
    defaultPageSize: SHOP_DEFAULT_PAGE_SIZE,
    defaultSort: 'relevance',
    locale,
    sortOptions: SHOP_SORT_OPTIONS.map((option) => option.value)
  })
  const listing = await getProducts(query)
  const sourcePath = buildCatalogueHref(path, resolvedParams, { page: resolvedParams.page })
  const clearHref = getClearFiltersHref(path, resolvedParams)
  const filterProps: Omit<CatalogueFiltersProps, 'variant'> = {
    brands,
    categories,
    clearHref,
    locale,
    params: resolvedParams,
    path,
    totalDocs: listing.totalDocs
  }

  return (
    <main className="bg-[var(--color-background)] py-7 sm:py-8 lg:py-10" id="main-content">
      <div className="container-catalog">
        <h1 className="sr-only">Boutique</h1>

        <nav aria-label="Catégories rapides" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <CategoryRail categories={categories} params={resolvedParams} path={path} />
        </nav>

        <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filtres du catalogue">
            <CatalogueFilters {...filterProps} variant="desktop" />
          </aside>

          <section className="min-w-0" aria-label="Produits de la boutique">
            <CartStatusNotice locale={locale} params={rawParams} />
            <CatalogueToolbar
              activeFilters={getActiveFilters({ brands, categories, params: resolvedParams, path })}
              clearHref={clearHref}
              defaultPageSize={SHOP_DEFAULT_PAGE_SIZE}
              defaultSort="relevance"
              filterProps={filterProps}
              page={listing.page}
              pageSize={query.pageSize ?? SHOP_DEFAULT_PAGE_SIZE}
              params={resolvedParams}
              path={path}
              sortOptions={SHOP_SORT_OPTIONS}
              totalDocs={listing.totalDocs}
            />
            {listing.products.length > 0 ? (
              <>
                <ProductGrid locale={locale} products={listing.products} sourcePath={sourcePath} view={resolvedParams.view === 'list' ? 'list' : 'grid'} />
                <Pagination page={listing.page} pathname={path} searchParams={resolvedParams} totalPages={listing.totalPages} />
              </>
            ) : (
              <EmptyState
                actionHref={clearHref}
                actionLabel="Réinitialiser les filtres"
                description="Essayez de retirer un filtre ou explorez une autre catégorie."
                title="Aucun produit ne correspond à vos filtres."
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
