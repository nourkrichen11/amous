import Image from 'next/image'

import type { BrandItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import { cn } from '@/lib/utils/cn'

type BrandLogoProps = {
  brand: Pick<BrandItem, 'logo' | 'name'>
  className?: string
  /** When the brand name is already rendered next to the logo, the image is decorative. */
  decorative?: boolean
  locale: Locale
  sizes: string
  textClassName?: string
}

/** Brand logo, or the brand name as a typographic fallback when no logo is uploaded. */
export function BrandLogo({ brand, className, decorative = false, locale, sizes, textClassName }: BrandLogoProps) {
  if (brand.logo?.url) {
    return (
      <span className={cn('relative block', className)}>
        <Image alt={decorative ? '' : t(locale, 'brands.logoAlt', { name: brand.name })} className="object-contain" fill sizes={sizes} src={brand.logo.url} />
      </span>
    )
  }

  return (
    <span
      aria-hidden={decorative || undefined}
      className={cn('line-clamp-2 break-words text-center font-extrabold uppercase leading-tight tracking-wide text-[var(--color-navy)]', textClassName)}
    >
      {brand.name}
    </span>
  )
}
