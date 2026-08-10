import Image from 'next/image'
import Link from 'next/link'

import { EmptyState } from '@/components/ui/EmptyState'
import type { BrandItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'

import { HomepageSectionShell } from './HomepageSectionShell'

type PartnerBrandsSectionProps = {
  brands: BrandItem[]
  locale: Locale
}

export function PartnerBrandsSection({ brands, locale }: PartnerBrandsSectionProps) {
  return (
    <HomepageSectionShell
      subtitle="Des marques reconnues pour leur qualite et leur fiabilite."
      title="Nos Marques Partenaires"
    >
      {brands.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
          {brands.map((brand) => (
            <Link
              className="flex min-h-[112px] items-center justify-center rounded-md border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-subtle)] transition-colors hover:border-[var(--color-primary)]"
              href={`/${locale}/boutique?brand=${brand.slug}`}
              key={String(brand.id)}
            >
              {brand.logo?.url ? (
                <div className="relative h-12 w-full">
                  <Image alt={brand.logo.alt || brand.name} className="object-contain" fill sizes="160px" src={brand.logo.url} />
                </div>
              ) : (
                <span className="text-center text-sm font-semibold text-[var(--color-text)]">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState actionHref={`/${locale}/boutique`} actionLabel="Voir la boutique" description="Les marques partenaires seront affichees ici lorsqu'elles seront disponibles." title="Aucune marque disponible" />
      )}
    </HomepageSectionShell>
  )
}
