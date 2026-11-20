import { describe, expect, it } from 'vitest'

import { getActiveFilters, getClearFiltersHref } from './activeFilters'
import { CATEGORY_SORT_OPTIONS, buildListingQuery, formatResultRange, parseListingPageSize } from './listingQuery'

const sorts = CATEGORY_SORT_OPTIONS.map((option) => option.value)

describe('buildListingQuery', () => {
  it('maps every URL filter to the backend query', () => {
    const query = buildListingQuery(
      { brand: 'bosch,stanley', limit: '32', maxPrice: '50', minPrice: '10.5', page: '2', q: '  perceuse ', sort: 'price-desc', stock: 'in_stock,low_stock,bogus' },
      { categoryIds: [1, 2], defaultPageSize: 24, defaultSort: 'new', locale: 'fr', searchScope: 'nameAndReference', sortOptions: sorts }
    )

    expect(query).toMatchObject({
      brandSlugs: ['bosch', 'stanley'],
      categoryIds: [1, 2],
      maxPrice: 50000,
      minPrice: 10500,
      page: 2,
      pageSize: 32,
      search: 'perceuse',
      searchScope: 'nameAndReference',
      sort: 'price-desc',
      stockStatuses: ['in_stock', 'low_stock']
    })
  })

  it('falls back to safe defaults for invalid values', () => {
    const query = buildListingQuery({ limit: '1000', page: '-3', sort: 'drop table' }, { defaultPageSize: 24, defaultSort: 'new', locale: 'fr', sortOptions: sorts })

    expect(query.pageSize).toBe(24)
    expect(query.page).toBe(1)
    expect(query.sort).toBe('new')
    expect(query.search).toBeUndefined()
  })

  it('swaps an inverted price range', () => {
    const query = buildListingQuery({ maxPrice: '10', minPrice: '90' }, { defaultPageSize: 24, locale: 'fr' })
    expect([query.minPrice, query.maxPrice]).toEqual([10000, 90000])
  })

  it('accepts only supported page sizes', () => {
    expect([12, 24, 32, 48].map((size) => parseListingPageSize(String(size), 24))).toEqual([12, 24, 32, 48])
    expect(parseListingPageSize('20', 24)).toBe(24)
  })
})

describe('formatResultRange', () => {
  it('describes the visible slice of results', () => {
    expect(formatResultRange(1, 32, 1136)).toBe(`1–32 sur ${new Intl.NumberFormat('fr-TN').format(1136)} produits`)
    expect(formatResultRange(2, 24, 30)).toBe('25–30 sur 30 produits')
    expect(formatResultRange(1, 24, 1)).toBe('1–1 sur 1 produit')
    expect(formatResultRange(1, 24, 0)).toBe('0 produit')
    expect(formatResultRange(5, 24, 2)).toBe('0 sur 2 produits')
  })
})

describe('active filters', () => {
  const params = { brand: 'bosch,stanley', limit: '32', maxPrice: '50', minPrice: '10', q: 'vis', sort: 'name', stock: 'in_stock', sub: 'visserie' }
  const filters = getActiveFilters({
    brands: [
      { name: 'Bosch', slug: 'bosch' },
      { name: 'Stanley', slug: 'stanley' }
    ],
    params,
    path: '/fr/c/quincaillerie',
    subcategories: [{ name: 'Visserie', slug: 'visserie' }]
  })

  it('lists each selected filter with a link that removes only that filter', () => {
    expect(filters.map((filter) => filter.label)).toEqual(['« vis »', 'Visserie', 'Bosch', 'Stanley', 'En stock', '10 DT – 50 DT'])
    const bosch = filters.find((filter) => filter.key === 'brand-bosch')
    expect(bosch?.href).toBe('/fr/c/quincaillerie?brand=stanley&limit=32&maxPrice=50&minPrice=10&q=vis&sort=name&stock=in_stock&sub=visserie')
  })

  it('orders an inverted price range in the chip label', () => {
    const [price] = getActiveFilters({ brands: [], params: { maxPrice: '1', minPrice: '200' }, path: '/fr/c/x' })
    expect(price.label).toBe('1 DT – 200 DT')
  })

  it('clears filters and search but keeps display preferences', () => {
    expect(getClearFiltersHref('/fr/c/quincaillerie', params)).toBe('/fr/c/quincaillerie?sort=name&limit=32')
  })
})
