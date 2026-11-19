import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Pagination } from './Pagination'

describe('Pagination', () => {
  const params = { brand: 'bosch', limit: '24', page: '3', q: 'vis', sort: 'price-asc', stock: 'in_stock' }

  it('keeps category search, filters and sorting on every page link', () => {
    render(<Pagination page={3} pathname="/fr/c/quincaillerie" searchParams={params} totalPages={10} />)

    expect(screen.getByRole('link', { name: 'Page suivante' })).toHaveAttribute('href', '/fr/c/quincaillerie?brand=bosch&limit=24&q=vis&sort=price-asc&stock=in_stock&page=4')
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/fr/c/quincaillerie?brand=bosch&limit=24&q=vis&sort=price-asc&stock=in_stock')
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pathname="/fr/c/x" searchParams={{}} totalPages={1} />)
    expect(container).toBeEmptyDOMElement()
  })
})
