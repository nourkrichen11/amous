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
    <HomepageSectionShell id="marques" subtitle="Des marques reconnues pour leur qualité et leur fiabilité." title="Nos Marques Partenaires">
      {brands.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6" role="list">
          {brands.map((brand) => (
            <li className="min-w-0" key={String(brand.id)}>
              <Link
                aria-label={`Voir les produits ${brand.name}`}
                className="group flex h-[76px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-3 py-3 transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[var(--shadow-hover)] sm:h-[88px] sm:px-4"
                href={`/${locale}/boutique?brand=${encodeURIComponent(brand.slug)}`}
                title={brand.name}
              >
                {brand.logo?.url ? (
                  <span className="relative block h-9 w-full max-w-[136px] sm:h-11">
                    <Image
                      alt={brand.name}
                      className="object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                      fill
                      sizes="(max-width: 639px) 30vw, 136px"
                      src={brand.logo.url}
                    />
                  </span>
                ) : (
                  <span className="line-clamp-2 break-words text-center text-sm font-extrabold uppercase leading-tight tracking-wide text-[var(--color-navy)] sm:text-[15px]">
                    {brand.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState actionHref={`/${locale}/boutique`} actionLabel="Voir la boutique" description="Les marques partenaires seront affichées ici lorsqu'elles seront disponibles." title="Aucune marque disponible" />
      )}
    </HomepageSectionShell>
  )
}
