'use client'

import { useEffect, useState } from 'react'

import type { HeroSlide } from '@/features/homepage/types'
import type { Locale } from '@/i18n/config'

import { HeroSlidePanel } from './HeroSlidePanel'

type HeroCarouselProps = {
  locale: Locale
  slides: HeroSlide[]
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export function HeroCarousel({ locale, slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const heroFrameClass = 'w-full'

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [reducedMotion, slides.length])

  const currentSlide = slides[activeIndex]

  return (
    <section
      aria-label={locale === 'fr' ? 'Hero principal' : 'Section principale'}
      aria-roledescription="carousel"
      className="w-full overflow-x-clip bg-[var(--color-surface)]"
    >
      <div className={`relative ${heroFrameClass}`}>
        <HeroSlidePanel asH1 priority={activeIndex === 0} slide={currentSlide} />
        {slides.length > 1 ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex

                return (
                  <button
                    aria-label={locale === 'fr' ? `Afficher la slide ${index + 1}` : `عرض الشريحة ${index + 1}`}
                    aria-pressed={isActive}
                    className={`h-2.5 min-w-[44px] rounded-full transition-all ${
                      isActive ? 'bg-white' : 'bg-white/45 hover:bg-white/70'
                    }`}
                    key={String(slide.id)}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
