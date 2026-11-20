import type { Metadata } from 'next'
import Link from 'next/link'

import { BrandCard } from '@/components/brand/BrandCard'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { getBrands } from '@/features/catalogue/data'
import { t } from '@/i18n/config'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type BrandsPageProps = {
  params: Promise<{ locale: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: BrandsPageProps): Promise<Metadata> {
  const locale = await resolveLocaleFromParams(params)
  const title = t(locale, 'brands.metaTitle')
  const description = t(locale, 'brands.metaDescription')

  return {
    alternates: {
      canonical: `/${locale}/marques`,
      languages: { ar: '/ar/marques', fr: '/fr/marques' }
    },
    description,
    openGraph: { description, title },
    title
  }
}

export default async function BrandsPage({ params }: BrandsPageProps) {
  const locale = await resolveLocaleFromParams(params)
  const brands = await getBrands(locale)
  const title = t(locale, 'brands.title')

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', item: `/${locale}`, name: t(locale, 'navigation.home'), position: 1 },
      { '@type': 'ListItem', item: `/${locale}/marques`, name: title, position: 2 }
    ]
  }

  return (
    <main className="bg-[var(--color-background)] py-5 sm:py-6 lg:pb-8 lg:pt-10" id="main-content">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <div className="container-catalog">
        <Breadcrumbs items={[{ label: title }]} locale={locale} />

        <section className="mt-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-bold tracking-normal text-[var(--color-navy)] sm:text-4xl">{title}</h1>
            {brands.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[var(--color-navy-soft)] px-2.5 py-0.5 text-[13px] font-semibold text-[var(--color-navy)]">
                {t(locale, brands.length > 1 ? 'brands.countOther' : 'brands.countOne', { count: brands.length })}
              </span>
            ) : null}
          </div>
          <p className="mt-2 max-w-[820px] text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">{t(locale, 'brands.description')}</p>
        </section>

        <section aria-label={title} className="mt-6 lg:mt-8">
          {brands.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" role="list">
              {brands.map((brand) => (
                <li className="min-w-0" key={String(brand.id)}>
                  <BrandCard brand={brand} locale={locale} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-bold text-[var(--color-navy)]">{t(locale, 'brands.emptyTitle')}</h2>
              <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t(locale, 'brands.emptyDescription')}</p>
              <Link
                className="mt-5 inline-flex min-h-[var(--touch-target)] items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[#c70511]"
                href={`/${locale}/boutique`}
              >
                {t(locale, 'brands.browseShop')}
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
