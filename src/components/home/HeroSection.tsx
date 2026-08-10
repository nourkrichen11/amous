import type { HeroSlide } from '@/features/homepage/types'
import type { Locale } from '@/i18n/config'

import { HeroCarousel } from './HeroCarousel'
import { HeroSlidePanel } from './HeroSlidePanel'

type HeroSectionProps = {
  locale: Locale
  slides: HeroSlide[]
}

export function HeroSection({ locale, slides }: HeroSectionProps) {
  if (slides.length === 0) {
    return null
  }

  const heroFrameClass = 'w-full'

  if (slides.length === 1) {
    return (
      <section aria-label={locale === 'fr' ? 'Hero principal' : 'Section principale'} className="w-full overflow-x-clip bg-[var(--color-surface)]">
        <div className={heroFrameClass}>
          <HeroSlidePanel asH1 priority slide={slides[0]} />
        </div>
      </section>
    )
  }

  return <HeroCarousel locale={locale} slides={slides.slice(0, 3)} />
}
