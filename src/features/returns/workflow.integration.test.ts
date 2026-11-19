import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { cleanupTestData, createTestCategory, createTestOrder, createTestProduct, createTestReturn } from '@/features/orders/__integration__/fixtures'
import { getPayloadClient } from '@/lib/payload/getPayload'

import { applyReturnAction } from './workflow'

const hasDb = Boolean(process.env.DATABASE_URI)

describe.skipIf(!hasDb)('applyReturnAction (integration)', () => {
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

  it('receive restocks inventory exactly once when restoreToStock is true, even if received twice', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 5 })
    const order = await createTestOrder(payload, product, { fulfillmentStatus: 'delivered', orderStatus: 'completed', quantity: 2 })
    const ret = await createTestReturn(payload, order, product, { quantity: 2, restoreToStock: true, status: 'approved' })

    const first = await applyReturnAction(payload, ret.id, { type: 'receive' })
    expect(first.changed).toBe(true)

    const second = await applyReturnAction(payload, ret.id, { type: 'receive' })
    expect(second.changed).toBe(false)

    const reloadedProduct = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloadedProduct.stockQuantity).toBe(7)

    const restocks = await payload.find({
      collection: 'stock-movements',
      overrideAccess: true,
      pagination: false,
      where: { and: [{ product: { equals: product.id } }, { type: { equals: 'return' } }] }
    })
    expect(restocks.docs).toHaveLength(1)

    const reloadedReturn = await payload.findByID({ collection: 'returns', id: ret.id, overrideAccess: true })
    expect(reloadedReturn.items?.[0]?.restocked).toBe(true)
  })

  it('does not restock when restoreToStock is false', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 5 })
    const order = await createTestOrder(payload, product, { fulfillmentStatus: 'delivered', orderStatus: 'completed', quantity: 2 })
    const ret = await createTestReturn(payload, order, product, { quantity: 2, restoreToStock: false, status: 'approved' })

    await applyReturnAction(payload, ret.id, { type: 'receive' })

    const reloadedProduct = await payload.findByID({ collection: 'products', id: product.id, overrideAccess: true })
    expect(reloadedProduct.stockQuantity).toBe(5)
  })

  it('rejects receiving a rejected return', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 5 })
    const order = await createTestOrder(payload, product, { fulfillmentStatus: 'delivered', orderStatus: 'completed', quantity: 1 })
    const ret = await createTestReturn(payload, order, product, { status: 'rejected' })

    await expect(applyReturnAction(payload, ret.id, { type: 'receive' })).rejects.toThrow('INVALID_ORDER_TRANSITION')
  })

  it('completing a full-order return rolls the parent order up to orderStatus: returned', async () => {
    const product = await createTestProduct(payload, categoryId, { reservedStock: 0, stockQuantity: 5 })
    const order = await createTestOrder(payload, product, { fulfillmentStatus: 'delivered', orderStatus: 'completed', quantity: 2 })
    const ret = await createTestReturn(payload, order, product, { quantity: 2, restoreToStock: true, status: 'received' })

    await applyReturnAction(payload, ret.id, { type: 'complete' })

    const reloadedOrder = await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })
    expect(reloadedOrder.orderStatus).toBe('returned')
    expect(reloadedOrder.fulfillmentStatus).toBe('returned')
  })
})
