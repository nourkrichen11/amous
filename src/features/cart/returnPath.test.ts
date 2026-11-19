import { describe, expect, it } from 'vitest'

import { resolveCartReturnPath, withCartStatus } from './returnPath'

describe('cart return path', () => {
  it('only accepts same-site paths', () => {
    expect(resolveCartReturnPath('/fr/c/outillage?brand=bosch', '/fr/panier')).toBe('/fr/c/outillage?brand=bosch')
    expect(resolveCartReturnPath('https://evil.example', '/fr/panier')).toBe('/fr/panier')
    expect(resolveCartReturnPath('//evil.example', '/fr/panier')).toBe('/fr/panier')
    expect(resolveCartReturnPath(String.raw`/\evil.example`, '/fr/panier')).toBe('/fr/panier')
    expect(resolveCartReturnPath('', '/fr/panier')).toBe('/fr/panier')
  })

  it('appends the status to existing filters instead of corrupting them', () => {
    expect(withCartStatus('/fr/c/outillage?brand=bosch&page=2', { cart: 'added' })).toBe('/fr/c/outillage?brand=bosch&page=2&cart=added')
    expect(withCartStatus('/fr', { cart: 'added' })).toBe('/fr?cart=added')
    expect(withCartStatus('/fr?cart=added', { cartError: 'out_of_stock' })).toBe('/fr?cartError=out_of_stock')
  })
})
