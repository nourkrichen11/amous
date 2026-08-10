import Image from 'next/image'

import type { HeroSlide } from '@/features/homepage/types'

type HeroSlidePanelProps = {
  asH1?: boolean
  priority?: boolean
  slide: HeroSlide
}

function getHeroImageSrc(src?: string) {
  if (!src) {
    return '/hero1.jpg'
  }

  if (src.endsWith('/hero1.jpg')) {
    return '/hero1.jpg'
  }

  return src
}

export function HeroSlidePanel({ asH1 = false, priority = false, slide }: HeroSlidePanelProps) {
  void asH1
  const mobileImage = slide.mobileImage || slide.desktopImage
  const mobileSrc = getHeroImageSrc(mobileImage.url)
  const desktopSrc = getHeroImageSrc(slide.desktopImage.url)

  return (
    <article className="w-full overflow-hidden bg-slate-100">
      <div className="relative h-[220px] sm:hidden">
        <Image
          alt={mobileImage.alt || slide.desktopImage.alt || slide.title}
          className="object-cover object-[62%_center]"
          fill
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          sizes="100vw"
          src={mobileSrc}
          unoptimized
        />
      </div>
      <div className="relative hidden aspect-[16/5] w-full bg-slate-100 sm:block">
        <Image
          alt={slide.desktopImage.alt || slide.title}
          className="object-contain object-center"
          fill
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          sizes="100vw"
          src={desktopSrc}
          unoptimized
        />
      </div>
    </article>
  )
}
