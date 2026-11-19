import type { Payload } from 'payload'

const MAX_ATTEMPTS = 50

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function slugify(value: string): string {
  const slug = stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)

  return slug || 'produit'
}

export function skuCode(name: string): string {
  const firstWord =
    stripDiacritics(name)
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)[0] ?? ''
  const letters = firstWord.replace(/[^A-Z]/g, '')

  return (letters || 'PRD').slice(0, 3).padEnd(3, 'X')
}

/**
 * Never overwrites a manually-entered value — callers are expected to only
 * invoke this when the field is empty. Uses `select`-projected queries and a
 * bounded retry loop rather than the advisory-lock/counter-table machinery
 * used for order numbers: product creation is a low-concurrency, admin-only
 * action, not a high-concurrency checkout path, so a simple collision retry
 * (backed by the field's existing `unique: true` DB constraint) is enough.
 */
export async function generateUniqueSlug(payload: Payload, name: string, existingId?: number | string): Promise<string> {
  const base = slugify(name)
  let attempt = 0
  let candidate = base

  while (attempt < MAX_ATTEMPTS) {
    const { docs } = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      locale: 'fr',
      overrideAccess: true,
      select: { id: true },
      where: { slug: { equals: candidate } }
    })

    const collision = docs[0]
    if (!collision || String(collision.id) === String(existingId)) {
      return candidate
    }

    attempt += 1
    candidate = `${base}-${attempt + 1}`
  }

  throw new Error(`SLUG_GENERATION_EXHAUSTED: ${base}`)
}

export async function generateUniqueSku(payload: Payload, name: string, existingId?: number | string): Promise<string> {
  const code = skuCode(name)

  const { totalDocs } = await payload.count({
    collection: 'products',
    overrideAccess: true,
    where: { sku: { like: `AM-${code}-` } }
  })

  let attempt = Math.max(1, totalDocs + 1)
  let iterations = 0
  let candidate = `AM-${code}-${String(attempt).padStart(3, '0')}`

  while (iterations < MAX_ATTEMPTS) {
    const { docs } = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      locale: 'fr',
      overrideAccess: true,
      select: { id: true },
      where: { sku: { equals: candidate } }
    })

    const collision = docs[0]
    if (!collision || String(collision.id) === String(existingId)) {
      return candidate
    }

    attempt += 1
    iterations += 1
    candidate = `AM-${code}-${String(attempt).padStart(3, '0')}`
  }

  throw new Error(`SKU_GENERATION_EXHAUSTED: ${code}`)
}
