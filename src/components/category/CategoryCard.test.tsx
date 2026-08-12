/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { CategoryItem } from '@/features/catalogue/types'

import { CategoryCard } from './CategoryCard'

vi.mock('next/image', () => ({
  default: ({ alt, fill, priority, src, unoptimized, ...props }: Record<string, unknown>) => {
    void fill
    void priority
    void unoptimized

    return <img alt={String(alt)} src={String(src)} {...props} />
  }
}))

const category: CategoryItem = {
  id: 'cat-1',
  image: {
    alt: 'Composition d’outils à main avec marteau, pinces, tournevis et clés sur fond clair.',
    id: 'media-1',
    url: '/images/categories/outillage-a-main.webp'
  },
  name: 'Outillage à main',
  shortDescription: 'Marteaux, tournevis, pinces, clés et outils essentiels pour les travaux quotidiens.',
  slug: 'outillage-a-main'
}

describe('CategoryCard', () => {
  it('renders the French content, image alt text, and action label', () => {
    render(<CategoryCard category={category} locale="fr" variant="detailed" />)

    expect(screen.getByRole('link', { name: /Outillage à main/i })).toHaveAttribute('href', '/fr/c/outillage-a-main')
    expect(screen.getByText('Outillage à main')).toBeInTheDocument()
    expect(screen.getByText(/Marteaux, tournevis/)).toBeInTheDocument()
    expect(screen.getByText('Découvrir')).toBeInTheDocument()
    expect(screen.getByAltText(category.image?.alt || '')).toBeInTheDocument()
  })
})
