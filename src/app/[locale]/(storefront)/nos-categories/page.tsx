import type { Metadata } from 'next'

import { CategoryCard } from '@/components/category/CategoryCard'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { getCategoryOverview } from '@/features/catalogue/data'
import { isLocale } from '@/i18n/config'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type CategoriesPageProps = {
  params: Promise<{ locale: string }>
}

export const revalidate = 3600

const pageTitle = 'Nos catégories'
const pageDescription =
  'Explorez toutes nos catégories et trouvez rapidement les outils, équipements et accessoires adaptés à vos travaux.'
const metaDescription =
  'Découvrez toutes les catégories de produits AMOUS : outillage, quincaillerie, électricité, peinture, sécurité, jardinage et équipements professionnels.'

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const locale = await resolveLocaleFromParams(params)

  return {
    alternates: {
      canonical: `/${locale}/nos-categories`,
      languages: {
        fr: '/fr/nos-categories'
      }
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      title: 'Nos catégories | AMOUS Quincaillerie'
    },
    title: 'Nos catégories | AMOUS Quincaillerie'
  }
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const categories = await getCategoryOverview(locale)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `/${locale}`, name: 'Accueil', position: 1 },
      { '@type': 'ListItem', item: `/${locale}/nos-categories`, name: pageTitle, position: 2 }
    ]
  }

  return (
    <main className="bg-[var(--color-background)] py-5 sm:py-6 lg:pb-8 lg:pt-12" id="main-content">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <div className="container-catalog">
        <div className="lg:hidden">
          <Breadcrumbs items={[{ label: pageTitle }]} locale={locale} />
        </div>

        <section className="mt-4 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-normal text-[var(--color-text)] sm:text-4xl lg:text-[46px] lg:leading-[1.14]">{pageTitle}</h1>
          <p className="mt-2 max-w-[920px] text-base leading-7 text-[var(--color-text-muted)] sm:text-lg lg:mt-3 lg:text-[19px]">
            {pageDescription}
          </p>
        </section>

        <section className="mt-6 lg:mt-10" aria-label="Catégories principales">
          {categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((category) => (
                <CategoryCard category={category} key={String(category.id)} locale={locale} variant="detailed" />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-[var(--color-text-muted)]">
              Aucune catégorie disponible pour le moment.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
