/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { HeroSlide } from '@/features/homepage/types'

import { HeroSection } from './HeroSection'

vi.mock('next/image', () => ({
  default: ({ alt, fill, priority, src, unoptimized, ...props }: Record<string, unknown>) => {
    void fill
    void priority
    void unoptimized

    return <img alt={String(alt)} src={String(src)} {...props} />
  }
}))

const singleSlide: HeroSlide = {
  contentPosition: 'center',
  desktopImage: { alt: 'Hero desktop', id: 'media-1', url: '/hero1.jpg' },
  id: 'slide-1',
  mobileImage: { alt: 'Hero mobile', id: 'media-2', url: '/hero1.jpg' },
  overlayStrength: 'medium',
  primaryCtaLabel: 'Decouvrir les produits',
  primaryCtaUrl: '/fr/boutique',
  secondaryCtaLabel: 'Demander un devis',
  secondaryCtaUrl: '/fr/recherche?q=devis',
  subtitle: 'Decouvrez notre selection.',
  textAlignment: 'left',
  textTheme: 'light',
  title: 'Equipez-vous pour construire, reparer et reussir'
}

describe('HeroSection', () => {
  it('renders one active slide as a static image banner without headings or controls', () => {
    render(<HeroSection locale="fr" slides={[singleSlide]} />)

    expect(screen.getByRole('img', { name: 'Hero mobile' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Hero desktop' })).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders multiple slides as an image-only carousel with slide indicators', () => {
    render(
      <HeroSection
        locale="fr"
        slides={[
          singleSlide,
          {
            ...singleSlide,
            id: 'slide-2',
            title: 'Deuxieme slide',
            textAlignment: 'center'
          }
        ]}
      />
    )

    expect(screen.getByRole('img', { name: 'Hero mobile' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Hero desktop' })).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('lets the user switch slides manually with the indicators', () => {
    render(
      <HeroSection
        locale="fr"
        slides={[
          singleSlide,
          {
            ...singleSlide,
            id: 'slide-2',
            title: 'Deuxieme slide',
            textAlignment: 'center'
          }
        ]}
      />
    )

    const indicators = screen.getAllByRole('button')

    expect(indicators[0]).toHaveAttribute('aria-pressed', 'true')
    expect(indicators[1]).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(indicators[1])

    expect(indicators[0]).toHaveAttribute('aria-pressed', 'false')
    expect(indicators[1]).toHaveAttribute('aria-pressed', 'true')
  })
})
