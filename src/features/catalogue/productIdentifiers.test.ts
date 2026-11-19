import { describe, expect, it, vi } from 'vitest'

import { generateUniqueSku, generateUniqueSlug, slugify } from './productIdentifiers'

describe('slugify', () => {
  it('strips accents and lowercases', () => {
    expect(slugify('Perceuse électroportative à percussion')).toBe('perceuse-electroportative-a-percussion')
  })

  it('collapses non-alphanumeric runs into single hyphens', () => {
    expect(slugify('Ampoule LED 12 W')).toBe('ampoule-led-12-w')
  })

  it('falls back to a default when nothing alphanumeric remains', () => {
    expect(slugify('***')).toBe('produit')
  })
})

function fakePayload({ existingSlugs = [] as string[], existingSkus = [] as string[] } = {}) {
  return {
    count: vi.fn(async ({ where }: { where: { sku: { like: string } } }) => ({
      totalDocs: existingSkus.filter((sku) => sku.startsWith(where.sku.like)).length
    })),
    find: vi.fn(async ({ where }: { where: { slug?: { equals: string }; sku?: { equals: string } } }) => {
      const target = where.slug?.equals ?? where.sku?.equals
      const pool = where.slug ? existingSlugs : existingSkus
      const match = pool.includes(target as string)
      return { docs: match ? [{ id: 1 }] : [] }
    })
  } as unknown as Parameters<typeof generateUniqueSlug>[0]
}

describe('generateUniqueSlug', () => {
  it('returns the base slug when there is no collision', async () => {
    const payload = fakePayload()
    await expect(generateUniqueSlug(payload, 'Pack fixations assorties')).resolves.toBe('pack-fixations-assorties')
  })

  it('appends an incrementing numeric suffix on collision', async () => {
    const payload = fakePayload({ existingSlugs: ['pack-fixations-assorties', 'pack-fixations-assorties-2'] })
    await expect(generateUniqueSlug(payload, 'Pack fixations assorties')).resolves.toBe('pack-fixations-assorties-3')
  })
})

describe('generateUniqueSku', () => {
  it('generates AM-<code>-001 when no SKU with that code exists yet', async () => {
    const payload = fakePayload()
    await expect(generateUniqueSku(payload, 'Ampoule LED 12 W')).resolves.toBe('AM-AMP-001')
  })

  it('starts numbering after the existing count for that code', async () => {
    const payload = fakePayload({ existingSkus: ['AM-AMP-001', 'AM-AMP-002'] })
    await expect(generateUniqueSku(payload, 'Ampoule LED 12 W')).resolves.toBe('AM-AMP-003')
  })

  it('pads short product-name codes', async () => {
    const payload = fakePayload()
    await expect(generateUniqueSku(payload, 'TV')).resolves.toBe('AM-TVX-001')
  })
})
