import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { cleanupTestData, createTestCategory, createTestOrder, createTestProduct } from './__integration__/fixtures'
import { makeCommercialOrderNumber } from './orderNumbers'
import { getPayloadClient } from '@/lib/payload/getPayload'

import { applyOrderAction } from './workflow'

const hasDb = Boolean(process.env.DATABASE_URI)

describe.skipIf(!hasDb)('applyOrderAction (integration)', () => {
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

  it('cancel releases inventory exactly once, even if called twice', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 2, stockQuantity: 10 })
    const order = await createTestOrder(payload, product, { quantity: 2 })

    const first = await applyOrderAction(payload, order.id, { type: 'cancel' })
    expect(first.changed).toBe(true)

    const second = await applyOrderAction(payload, order.id, { type: 'cancel' })
    expect(second.changed).toBe(false)

    const reloadedProduct = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloadedProduct.reservedStock).toBe(0)

    const releases = await payload.find({
      collection: 'stock-movements',
      overrideAccess: true,
      pagination: false,
      where: { and: [{ product: { equals: product.id } }, { type: { equals: 'reservation_release' } }] }
    })
    expect(releases.docs).toHaveLength(1)
  })

  it('confirm -> start_fulfillment -> fulfill(shipped) -> fulfill(delivered) deducts physical stock exactly once', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 2, stockQuantity: 10 })
    const order = await createTestOrder(payload, product, { quantity: 2 })

    await applyOrderAction(payload, order.id, { type: 'confirm' })
    await applyOrderAction(payload, order.id, { type: 'start_fulfillment' })
    const shipped = await applyOrderAction(payload, order.id, { stage: 'shipped', type: 'fulfill' })
    expect(shipped.changed).toBe(true)

    const afterShipped = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(afterShipped.stockQuantity).toBe(8)
    expect(afterShipped.reservedStock).toBe(0)

    // The exact bug in the old dead code: a later `delivered` transition
    // must NOT deduct stockQuantity a second time.
    const delivered = await applyOrderAction(payload, order.id, { stage: 'delivered', type: 'fulfill' })
    expect(delivered.changed).toBe(true)

    const afterDelivered = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(afterDelivered.stockQuantity).toBe(8)

    const fulfillments = await payload.find({
      collection: 'stock-movements',
      overrideAccess: true,
      pagination: false,
      where: { and: [{ product: { equals: product.id } }, { type: { equals: 'order_fulfillment' } }] }
    })
    expect(fulfillments.docs).toHaveLength(1)

    const reloadedOrder = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })
    expect(reloadedOrder.orderStatus).toBe('completed')
    expect(reloadedOrder.paymentStatus).toBe('paid')
    expect(reloadedOrder.status).toBe('delivered')
  })

  it('rejects an illegal transition (cancel after shipped) without mutating inventory', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 2, stockQuantity: 10 })
    const order = await createTestOrder(payload, product, { fulfillmentStatus: 'shipped', quantity: 2 })

    await expect(applyOrderAction(payload, order.id, { type: 'cancel' })).rejects.toThrow('INVALID_ORDER_TRANSITION')

    const reloadedProduct = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloadedProduct.reservedStock).toBe(2)
  })

  it('records an OrderEvent for every applied transition', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 1, stockQuantity: 10 })
    const order = await createTestOrder(payload, product, { quantity: 1 })

    await applyOrderAction(payload, order.id, { type: 'confirm' })
    await applyOrderAction(payload, order.id, { type: 'cancel' })

    const events = await payload.find({
      collection: 'order-events',
      overrideAccess: true,
      pagination: false,
      sort: 'createdAt',
      where: { order: { equals: order.id } }
    })

    expect(events.docs.map((event) => event.eventType)).toEqual(['order_confirmed', 'order_cancelled'])
  })
})

describe.skipIf(!hasDb)('makeCommercialOrderNumber (integration)', () => {
  let payload: Awaited<ReturnType<typeof getPayloadClient>>

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  it('produces distinct order numbers under concurrent transactions', async () => {
    async function generate() {
      const transactionID = await payload.db.beginTransaction()
      if (transactionID == null) throw new Error('NO_ACTIVE_TRANSACTION')
      try {
        const orderNumber = await makeCommercialOrderNumber(payload, transactionID)
        await payload.db.commitTransaction(transactionID)
        return orderNumber
      } catch (error) {
        await payload.db.rollbackTransaction(transactionID)
        throw error
      }
    }

    const numbers = await Promise.all(Array.from({ length: 5 }, () => generate()))
    expect(new Set(numbers).size).toBe(numbers.length)
  })
})
