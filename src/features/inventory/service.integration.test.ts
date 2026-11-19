import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { cleanupTestData, createTestCategory, createTestProduct } from '@/features/orders/__integration__/fixtures'
import { getPayloadClient } from '@/lib/payload/getPayload'

import { fulfillReservedInventory, releaseInventoryReservation, reserveInventory, restockInventory } from './service'

const hasDb = Boolean(process.env.DATABASE_URI)

describe.skipIf(!hasDb)('inventory service (integration)', () => {
  let payload: Awaited<ReturnType<typeof getPayloadClient>>
  let categoryId: number | string

  beforeAll(async () => {
    payload = await getPayloadClient()
    const category = await createTestCategory(payload)
    categoryId = category.id
  })

  afterAll(async () => {
    await cleanupTestData(payload)
  })

  async function withTransaction<T>(fn: (transactionID: number | string) => Promise<T>) {
    const transactionID = await payload.db.beginTransaction()
    if (transactionID == null) throw new Error('NO_ACTIVE_TRANSACTION')
    try {
      const result = await fn(transactionID)
      await payload.db.commitTransaction(transactionID)
      return result
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }

  it('reserveInventory increments reservedStock and leaves stockQuantity untouched', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 2, stockQuantity: 10 })

    await withTransaction((transactionID) =>
      reserveInventory(payload, [{ productId: product.id, quantity: 3 }], { reason: 'test reserve', transactionID })
    )

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.stockQuantity).toBe(10)
    expect(reloaded.reservedStock).toBe(5)
  })

  it('reserveInventory throws INSUFFICIENT_STOCK and leaves inventory unchanged when over-requesting', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 9, stockQuantity: 10 })

    await expect(
      withTransaction((transactionID) => reserveInventory(payload, [{ productId: product.id, quantity: 5 }], { reason: 'test', transactionID }))
    ).rejects.toThrow('INSUFFICIENT_STOCK')

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.stockQuantity).toBe(10)
    expect(reloaded.reservedStock).toBe(9)
  })

  it('multi-item reservation is all-or-nothing: one unavailable line rolls back the whole reservation', async () => {
    const available = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 10 })
    const unavailable = await createTestProduct(payload, categoryId, { reservedStock: 10, stockQuantity: 10 })

    await expect(
      withTransaction((transactionID) =>
        reserveInventory(
          payload,
          [
            { productId: available.id, quantity: 2 },
            { productId: unavailable.id, quantity: 1 }
          ],
          { reason: 'test multi-item', transactionID }
        )
      )
    ).rejects.toThrow('INSUFFICIENT_STOCK')

    const reloadedAvailable = await payload.findByID({ collection: 'products', id: available.id, overrideAccess: true })
    expect(reloadedAvailable.reservedStock).toBe(0)
  })

  it('releaseInventoryReservation decrements reservedStock exactly by the released quantity', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 5, stockQuantity: 10 })

    await withTransaction((transactionID) =>
      releaseInventoryReservation(payload, [{ productId: product.id, quantity: 2 }], { reason: 'test release', transactionID })
    )

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.reservedStock).toBe(3)
    expect(reloaded.stockQuantity).toBe(10)
  })

  it('fulfillReservedInventory deducts both stockQuantity and reservedStock exactly once', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 3, stockQuantity: 10 })

    await withTransaction((transactionID) =>
      fulfillReservedInventory(payload, [{ productId: product.id, quantity: 3 }], { reason: 'test fulfill', transactionID })
    )

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.stockQuantity).toBe(7)
    expect(reloaded.reservedStock).toBe(0)
  })

  it('restockInventory increases stockQuantity without touching reservedStock', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 2, stockQuantity: 5 })

    await withTransaction((transactionID) =>
      restockInventory(payload, [{ productId: product.id, quantity: 4 }], { reason: 'test restock', transactionID })
    )

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.stockQuantity).toBe(9)
    expect(reloaded.reservedStock).toBe(2)
  })

  // The mandatory concurrency test: two independent transactions racing to
  // reserve the last unit of stock. Before the advisory-lock fix, this both
  // resolved successfully and left `reservedStock` under-counted (a classic
  // lost update) — this is a genuine regression guard, not a formality.
  it('exactly one of two concurrent reservations for the last unit succeeds, and the final reservedStock is consistent', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 1 })

    async function attempt(label: string) {
      const transactionID = await payload.db.beginTransaction()
      if (transactionID == null) throw new Error('NO_ACTIVE_TRANSACTION')
      try {
        await reserveInventory(payload, [{ productId: product.id, quantity: 1 }], { reason: label, transactionID })
        await payload.db.commitTransaction(transactionID)
        return 'ok' as const
      } catch (error) {
        await payload.db.rollbackTransaction(transactionID)
        if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
          return 'insufficient' as const
        }
        throw error
      }
    }

    const [a, b] = await Promise.all([attempt('concurrent-A'), attempt('concurrent-B')])
    const outcomes = [a, b]

    expect(outcomes.filter((o) => o === 'ok')).toHaveLength(1)
    expect(outcomes.filter((o) => o === 'insufficient')).toHaveLength(1)

    const reloaded = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloaded.reservedStock).toBe(1)
    expect(reloaded.stockQuantity).toBe(1)

    const movements = await payload.find({
      collection: 'stock-movements',
      overrideAccess: true,
      pagination: false,
      where: { and: [{ product: { equals: product.id } }, { type: { equals: 'order_reservation' } }] }
    })
    expect(movements.docs).toHaveLength(1)
  })
})
