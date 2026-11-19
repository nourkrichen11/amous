import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'

export const TEST_PREFIX = 'TEST-INTEGRATION-'

export async function createTestCategory(payload: Payload) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'categories',
    data: {
      active: false,
      description: 'Categorie de test cree par la suite d integration.',
      name: `${TEST_PREFIX}category-${suffix}`,
      slug: `${TEST_PREFIX.toLowerCase()}category-${suffix}`
    },
    overrideAccess: true
  })
}

export async function createTestProduct(
  payload: Payload,
  categoryId: number | string,
  overrides: Partial<{ lowStockThreshold: number; publicPrice: number; reservedStock: number; stockQuantity: number }> = {}
) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'products',
    data: {
      active: true,
      category: categoryId,
      lowStockThreshold: overrides.lowStockThreshold ?? 5,
      name: `${TEST_PREFIX}product-${suffix}`,
      publicPrice: overrides.publicPrice ?? 10000,
      reservedStock: overrides.reservedStock ?? 0,
      sku: `${TEST_PREFIX}${suffix}`,
      slug: `${TEST_PREFIX.toLowerCase()}${suffix}`,
      stockQuantity: overrides.stockQuantity ?? 10,
      vatRate: 19
    },
    overrideAccess: true
  })
}

export async function createTestOrder(
  payload: Payload,
  product: { id: number | string; name?: string; publicPrice?: number; sku?: string; vatRate?: number },
  overrides: Partial<{
    confirmationStatus: string
    fulfillmentStatus: string
    orderStatus: string
    paymentStatus: string
    quantity: number
  }> = {}
) {
  const suffix = randomUUID()
  const quantity = overrides.quantity ?? 1
  const unitPrice = product.publicPrice ?? 10000
  const vatRate = product.vatRate ?? 19
  const lineSubtotal = Math.round((unitPrice * quantity * 100) / (100 + vatRate))
  const lineVatTotal = unitPrice * quantity - lineSubtotal
  const lineTotal = unitPrice * quantity

  return payload.create({
    collection: 'orders',
    data: {
      confirmationStatus: overrides.confirmationStatus ?? 'pending',
      confirmationToken: suffix,
      currency: 'TND',
      customerEmail: `${TEST_PREFIX.toLowerCase()}${suffix}@example.com`,
      customerFirstName: 'Test',
      customerLastName: 'Integration',
      customerPhone: '20000000',
      deliveryCost: 0,
      deliveryMethod: 'home_delivery',
      fulfillmentStatus: overrides.fulfillmentStatus ?? 'unfulfilled',
      idempotencyKey: `${TEST_PREFIX}${suffix}`,
      items: [
        {
          lineSubtotal,
          lineTotal,
          lineVatTotal,
          product: product.id,
          productName: product.name ?? 'Test product',
          productSku: product.sku ?? 'TEST-SKU',
          quantity,
          unit: 'piece',
          unitPrice,
          vatRate
        }
      ],
      locale: 'fr',
      orderNumber: `${TEST_PREFIX}${suffix}`,
      orderStatus: overrides.orderStatus ?? 'new',
      paymentMethod: 'cash_on_delivery',
      paymentStatus: overrides.paymentStatus ?? 'unpaid',
      status: 'received',
      subtotal: lineSubtotal,
      total: lineTotal,
      vatTotal: lineVatTotal
    },
    overrideAccess: true
  })
}

export async function createTestReturn(
  payload: Payload,
  order: { id: number | string },
  product: { id: number | string; name?: string; sku?: string },
  overrides: Partial<{ quantity: number; restoreToStock: boolean; status: string }> = {}
) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'returns',
    data: {
      items: [
        {
          product: product.id,
          productName: product.name ?? 'Test product',
          productSku: product.sku ?? 'TEST-SKU',
          quantity: overrides.quantity ?? 1,
          restoreToStock: overrides.restoreToStock ?? true
        }
      ],
      order: order.id,
      reason: 'Test integration return',
      returnNumber: `${TEST_PREFIX}${suffix}`,
      status: overrides.status ?? 'requested'
    },
    overrideAccess: true
  })
}

/**
 * Deletion order matters: order-events/stock-movements/returns hold foreign
 * keys pointing at orders (and stock-movements/returns at products too), so
 * those referencing rows must go first — deleting `orders` or `products`
 * while something still points at them throws a foreign-key violation and
 * poisons the rest of the (implicit, per-delete-call) transaction.
 */
export async function cleanupTestData(payload: Payload | undefined) {
  if (!payload) {
    // beforeAll never got far enough to initialize the client — nothing to clean up.
    return
  }

  const [orders, returns, products] = await Promise.all([
    payload.find({ collection: 'orders', limit: 0, overrideAccess: true, pagination: false, where: { orderNumber: { like: TEST_PREFIX } } }),
    payload.find({ collection: 'returns', limit: 0, overrideAccess: true, pagination: false, where: { returnNumber: { like: TEST_PREFIX } } }),
    payload.find({ collection: 'products', limit: 0, overrideAccess: true, pagination: false, where: { sku: { like: TEST_PREFIX } } })
  ])
  const orderIds = orders.docs.map((doc) => doc.id)
  const productIds = products.docs.map((doc) => doc.id)

  if (orderIds.length > 0) {
    await payload.delete({ collection: 'order-events', overrideAccess: true, where: { order: { in: orderIds } } })
  }

  // Filtered by product id, not by `reason` text — call sites are free to
  // pass any reason string (several tests use plain strings like 'test
  // reserve' with no TEST-INTEGRATION- prefix at all), so a text filter here
  // would silently miss rows and leave them referencing a product we're
  // about to delete, poisoning the delete with a foreign-key violation.
  if (productIds.length > 0) {
    await payload.delete({ collection: 'stock-movements', overrideAccess: true, where: { product: { in: productIds } } })
  }

  if (returns.docs.length > 0) {
    await payload.delete({ collection: 'returns', overrideAccess: true, where: { returnNumber: { like: TEST_PREFIX } } })
  }

  if (orderIds.length > 0) {
    await payload.delete({ collection: 'orders', overrideAccess: true, where: { id: { in: orderIds } } })
  }

  if (productIds.length > 0) {
    await payload.delete({ collection: 'products', overrideAccess: true, where: { id: { in: productIds } } })
  }

  await payload.delete({ collection: 'categories', overrideAccess: true, where: { slug: { like: TEST_PREFIX.toLowerCase() } } })
}
