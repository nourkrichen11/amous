import type { Metadata } from 'next'

import { CategoryCard } from '@/components/category/CategoryCard'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { getCategoryOverview } from '@/features/catalogue/data'
import { isLocale } from '@/i18n/config'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type CategoriesPageProps = {
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

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
    <main className="bg-[var(--color-background)] py-8 sm:py-10" id="main-content">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <div className="container-page">
        <Breadcrumbs items={[{ label: pageTitle }]} locale={locale} />

        <section className="mt-6 border-b border-[var(--color-border)] pb-7">
          <div className="h-1 w-12 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-[var(--color-text)] sm:text-4xl">{pageTitle}</h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">{pageDescription}</p>
        </section>

        <section className="mt-8" aria-label="Catégories principales">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
