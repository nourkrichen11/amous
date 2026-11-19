import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProductCard } from './ProductCard'
import type { ProductItem } from '@/features/catalogue/types'

const product: ProductItem = {
  featured: true,
  id: '1',
  images: [],
  minimumOrderQuantity: 1,
  name: 'Perceuse Bosch 650 W',
  newProduct: true,
  previousPrice: 189000,
  promotionalProduct: true,
  publicPrice: 169000,
  quantityIncrement: 1,
  shortDescription: 'Perceuse puissante',
  sku: 'AM-BOS-650',
  slug: 'perceuse-bosch-650w',
  stockQuantity: 12,
  stockStatus: 'in_stock',
  technicalAttributes: [],
  unit: 'piece',
  vatRate: 19
}

describe('ProductCard', () => {
  it('displays price, stock state, SKU, and add-to-cart action', () => {
    render(<ProductCard locale="fr" product={product} />)

    expect(screen.getByText('Perceuse Bosch 650 W')).toBeInTheDocument()
    expect(screen.getByText(/AM-BOS-650/)).toBeInTheDocument()
    expect(screen.getByText('En stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajouter au panier' })).toBeInTheDocument()
  })

  it('formats prices in Tunisian dinars and shows a discount badge', () => {
    render(<ProductCard locale="fr" product={product} />)

    expect(screen.getByText('169 DT')).toBeInTheDocument()
    expect(screen.getByText('189 DT')).toBeInTheDocument()
    expect(screen.getByText('-11%')).toBeInTheDocument()
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('renders a clean fallback when the product has no image', () => {
    render(<ProductCard locale="fr" product={product} />)

    expect(screen.getByRole('img', { hidden: true, name: 'Perceuse Bosch 650 W' })).toBeInTheDocument()
  })

  it('links to the product page instead of adding to cart when out of stock', () => {
    render(<ProductCard headingLevel="h3" locale="fr" product={{ ...product, stockQuantity: 0, stockStatus: 'out_of_stock' }} />)

    expect(screen.queryByRole('button', { name: 'Ajouter au panier' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voir le produit' })).toHaveAttribute('href', '/fr/p/perceuse-bosch-650w')
    expect(screen.getByRole('heading', { level: 3, name: 'Perceuse Bosch 650 W' })).toBeInTheDocument()
  })
})
