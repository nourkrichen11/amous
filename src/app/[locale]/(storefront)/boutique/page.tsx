import type { Metadata } from 'next'

import { CategoryRail } from '@/components/catalogue/CategoryRail'
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { CatalogueToolbar } from '@/components/catalogue/CatalogueToolbar'
import { Pagination } from '@/components/catalogue/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { getAllParentCategories, getBrands, getProducts } from '@/features/catalogue/data'
import { normalizeSearchParams, parseList, parseMillimePrice, parsePage, parsePageSize } from '@/features/catalogue/searchParams'
import type { ProductItem } from '@/features/catalogue/types'
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

function isStockStatus(value: string): value is ProductItem['stockStatus'] {
  return ['in_stock', 'low_stock', 'out_of_stock'].includes(value)
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const path = `/${locale}/boutique`
  const resolvedParams = normalizeSearchParams(await searchParams)
  const [categories, brands] = await Promise.all([getAllParentCategories(locale), getBrands(locale)])
  const selectedCategory = categories.find((category) => category.slug === resolvedParams.category)
  const selectedSubcategory = selectedCategory?.children?.find((category) => category.slug === resolvedParams.subcategory)
  const categoryIds = selectedSubcategory
    ? [selectedSubcategory.id]
    : selectedCategory
      ? [selectedCategory.id, ...(selectedCategory.children?.map((category) => category.id) ?? [])]
      : undefined
  const stockStatuses = parseList(resolvedParams.stock).filter(isStockStatus)
  const pageSize = parsePageSize(resolvedParams.limit)
  const listing = await getProducts({
    brandSlugs: parseList(resolvedParams.brand),
    categoryIds,
    featured: resolvedParams.featured === '1',
    inStock: resolvedParams.inStock === '1',
    locale,
    maxPrice: parseMillimePrice(resolvedParams.maxPrice),
    minPrice: parseMillimePrice(resolvedParams.minPrice),
    newProduct: resolvedParams.new === '1',
    page: parsePage(resolvedParams.page),
    pageSize,
    promotion: resolvedParams.promotion === '1',
    search: resolvedParams.q,
    sort: resolvedParams.sort,
    stockStatuses
  })
  const sourcePath = buildCatalogueHref(path, resolvedParams, { page: resolvedParams.page })

  return (
    <main className="bg-[var(--color-background)] py-7 sm:py-8 lg:py-10" id="main-content">
      <div className="container-catalog">
        <h1 className="sr-only">Boutique</h1>

        <nav aria-label="Catégories rapides" className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <CategoryRail categories={categories} params={resolvedParams} path={path} />
        </nav>

        <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filtres du catalogue">
            <CatalogueFilters brands={brands} categories={categories} locale={locale} params={resolvedParams} path={path} totalDocs={listing.totalDocs} variant="desktop" />
          </aside>

          <section className="min-w-0" aria-label="Produits de la boutique">
            <CatalogueToolbar brands={brands} categories={categories} locale={locale} params={resolvedParams} path={path} totalDocs={listing.totalDocs} />
            {listing.products.length > 0 ? (
              <>
                <ProductGrid locale={locale} products={listing.products} sourcePath={sourcePath} view={resolvedParams.view === 'list' ? 'list' : 'grid'} />
                <Pagination page={listing.page} pathname={path} searchParams={resolvedParams} totalPages={listing.totalPages} />
              </>
            ) : (
              <EmptyState
                actionHref={path}
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
