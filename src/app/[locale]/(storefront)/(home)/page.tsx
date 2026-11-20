import type { Metadata } from 'next'
import { BestSellingProductsSection } from '@/components/home/BestSellingProductsSection'
import { CurrentPromotionsSection } from '@/components/home/CurrentPromotionsSection'
import { HeroSection } from '@/components/home/HeroSection'
import { MainCategoriesSection } from '@/components/home/MainCategoriesSection'
import { NewProductsSection } from '@/components/home/NewProductsSection'
import { PartnerBrandsSection } from '@/components/home/PartnerBrandsSection'
import { getHomepageSections } from '@/features/catalogue/data'
import { getHeroMetadata, getHeroSlides } from '@/features/homepage/data'
import { t } from '@/i18n/config'
import { resolveLocaleFromParams } from '@/lib/locale/resolveLocale'

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export const revalidate = 600

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = await resolveLocaleFromParams(params)
  const slides = await getHeroSlides(locale)
  const metadata = getHeroMetadata(slides, locale)

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: '/ar', fr: '/fr' }
    },
    description: metadata.description,
    title: metadata.title
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = await resolveLocaleFromParams(params)
  const [slides, sections] = await Promise.all([getHeroSlides(locale), getHomepageSections(locale)])

  return (
    <main id="main-content">
      {slides.length > 0 ? (
        <HeroSection locale={locale} slides={slides} />
      ) : (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="container-wide flex min-h-[420px] items-center py-12 sm:min-h-[460px] lg:min-h-[520px]">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-normal sm:text-5xl">Amous</h1>
              <p className="mt-4 text-lg text-[var(--color-text-muted)]">{t(locale, 'home.heroFallback')}</p>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-12 pt-10 md:space-y-16 md:pt-14">
        <MainCategoriesSection categories={sections.mainCategories} locale={locale} />
        <BestSellingProductsSection locale={locale} products={sections.bestSellingProducts} />
        <CurrentPromotionsSection locale={locale} products={sections.currentPromotions} />
        <PartnerBrandsSection brands={sections.partnerBrands} locale={locale} />
        <NewProductsSection locale={locale} products={sections.newProducts} />
      </div>
    </main>
  )
}
