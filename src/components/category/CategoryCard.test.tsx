/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { CategoryItem } from '@/features/catalogue/types'

import { CategoryCard, formatCategoryProductCount } from './CategoryCard'

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

  it('pluralizes the product count from catalog data', () => {
    expect(formatCategoryProductCount(0, 'fr')).toBe('0 produit')
    expect(formatCategoryProductCount(1, 'fr')).toBe('1 produit')
    expect(formatCategoryProductCount(24, 'fr')).toBe('24 produits')

    render(<CategoryCard category={{ ...category, productCount: 24 }} locale="fr" />)
    expect(screen.getByText('24 produits')).toBeInTheDocument()
  })
})
