import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { CategoryCard } from '@/components/category/CategoryCard'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { Pagination } from '@/components/catalogue/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { getBrands, getCategories, getCategoryBySlug, getProducts, getRelatedCategories } from '@/features/catalogue/data'
import { normalizeSearchParams, parseMillimePrice, parsePage } from '@/features/catalogue/searchParams'
import { formatNumber } from '@/lib/formatting/currency'
import { isLocale, t } from '@/i18n/config'

type CategoryPageProps = {
  params: Promise<{ categorySlug: string; locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug, locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const category = await getCategoryBySlug(locale, categorySlug)

  if (!category) {
    notFound()
  }

  const resolvedParams = normalizeSearchParams(await searchParams)
  const [children, brands, listing, relatedCategories] = await Promise.all([
    getCategories(locale, category.id),
    getBrands(locale),
    getProducts({
      brandSlug: resolvedParams.brand,
      categoryId: category.id,
      inStock: resolvedParams.inStock === '1',
      locale,
      maxPrice: parseMillimePrice(resolvedParams.maxPrice),
      minPrice: parseMillimePrice(resolvedParams.minPrice),
      page: parsePage(resolvedParams.page),
      promotion: resolvedParams.promotion === '1',
      sort: resolvedParams.sort
    }),
    getRelatedCategories(locale, category)
  ])

  const breadcrumbItems = [
    { href: `/${locale}/nos-categories`, label: 'Nos categories' },
    { label: category.name }
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `/${locale}`, name: t(locale, 'navigation.home'), position: 1 },
      { '@type': 'ListItem', item: `/${locale}/nos-categories`, name: 'Nos categories', position: 2 },
      { '@type': 'ListItem', item: `/${locale}/c/${category.slug}`, name: category.name, position: 3 }
    ]
  }

  return (
    <main className="container-page py-8" id="main-content">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      <section className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white">
        <div className="relative h-[240px] bg-slate-100 sm:h-[280px] lg:h-[320px]">
          {category.image?.url ? (
            <Image
              alt={category.image.alt || category.name}
              className="object-cover object-center"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              src={category.image.url}
            />
          ) : null}
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.shortDescription ? <p className="max-w-3xl text-[var(--color-text-muted)]">{category.shortDescription}</p> : null}
          <p className="text-sm text-[var(--color-text-muted)]">{t(locale, 'catalogue.productsCount', { count: formatNumber(listing.totalDocs, locale) })}</p>
        </div>
      </section>

      {children.length > 0 ? (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Sous-categories</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Affinez votre recherche a partir des familles liees.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {children.map((child) => (
              <CategoryCard category={child} key={String(child.id)} locale={locale} variant="compact" />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside>
          <CatalogueFilters brands={brands} locale={locale} params={resolvedParams} path={`/${locale}/c/${category.slug}`} />
        </aside>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Produits de la categorie</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Triez et filtrez les references disponibles selon vos besoins.</p>
          </div>

          {listing.products.length > 0 ? (
            <>
              <ProductGrid locale={locale} products={listing.products} />
              <Pagination page={listing.page} pathname={`/${locale}/c/${category.slug}`} searchParams={resolvedParams} totalPages={listing.totalPages} />
            </>
          ) : (
            <EmptyState
              actionHref={`/${locale}/boutique`}
              actionLabel="Voir la boutique"
              description="Aucun produit n&apos;est disponible dans cette categorie pour le moment."
              title="Aucun produit pour l'instant"
            />
          )}
        </section>
      </div>

      {relatedCategories.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Categories liees</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">D&apos;autres univers proches a explorer sur Amous.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedCategories.map((relatedCategory) => (
              <CategoryCard category={relatedCategory} key={String(relatedCategory.id)} locale={locale} variant="compact" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
