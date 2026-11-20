import { describe, expect, it } from 'vitest'

import { upgradeLegacyBrandsLink } from './navigation'

describe('upgradeLegacyBrandsLink', () => {
  it('points the legacy seeded Brands entry to the brand directory', () => {
    expect(upgradeLegacyBrandsLink({ id: 'row-1', label: 'Marques', url: '/fr/boutique' }, 'fr')).toEqual({ id: 'brands', label: 'Marques', url: '/fr/marques' })
    expect(upgradeLegacyBrandsLink({ id: 'row-2', label: 'العلامات', url: '/ar/boutique' }, 'ar')).toEqual({ id: 'brands', label: 'العلامات', url: '/ar/marques' })
    expect(upgradeLegacyBrandsLink({ id: 'row-3', label: ' marques ', url: '/boutique/' }, 'fr').url).toBe('/fr/marques')
  })

  it('preserves the Boutique link and custom navigation', () => {
    const boutique = { id: 'row-4', label: 'Boutique', url: '/fr/boutique' }
    const filtered = { id: 'row-5', label: 'Marques', url: '/fr/boutique?brand=bosch' }
    const custom = { id: 'row-6', label: 'Marques', url: '/fr/nos-partenaires' }
    const promo = { id: 'row-7', label: 'Promotions', url: '/fr/boutique?promotion=1' }

    ;[boutique, filtered, custom, promo].forEach((item) => expect(upgradeLegacyBrandsLink(item, 'fr')).toBe(item))
  })
})
