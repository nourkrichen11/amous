import type { Payload } from 'payload'

import { lockRow, LOCK_NS } from '@/features/db/advisoryLock'

import { getStockStatus } from './status'

type ID = string | number

type ProductInventoryDoc = {
  id: ID
  lowStockThreshold?: number
  reservedStock?: number
  stockQuantity?: number
}

type InventoryLine = {
  productId: ID
  quantity: number
}

type InventoryMutationOptions = {
  adminId?: ID
  note?: string
  orderId?: ID
  reason: string
  /**
   * Must be an already-resolved transaction id (not a Promise) — the
   * advisory-lock primitive needs it synchronously to key the lock, and every
   * caller in this codebase already awaits `payload.db.beginTransaction()`
   * before reaching here.
   */
  transactionID: number | string
}

function sortedByProductId<T extends { productId: ID }>(lines: T[]): T[] {
  return [...lines].sort((a, b) => Number(a.productId) - Number(b.productId))
}

async function getProduct(payload: Payload, productId: ID, transactionID: InventoryMutationOptions['transactionID']) {
  return (await payload.findByID({
    collection: 'products',
    id: productId,
    overrideAccess: true,
    req: { transactionID } as never
  })) as ProductInventoryDoc
}

async function writeMovement(
  payload: Payload,
  product: ProductInventoryDoc,
  data: {
    adminId?: ID
    note?: string
    orderId?: ID
    previousQuantity: number
    previousReservedStock: number
    quantityDelta: number
    reason: string
    resultingQuantity: number
    resultingReservedStock: number
    transactionID: InventoryMutationOptions['transactionID']
    type: string
  }
) {
  await payload.create({
    collection: 'stock-movements',
    data: {
      admin: data.adminId,
      note: data.note,
      order: data.orderId,
      previousQuantity: data.previousQuantity,
      previousReservedStock: data.previousReservedStock,
      product: product.id,
      quantityDelta: data.quantityDelta,
      reason: data.reason,
      resultingQuantity: data.resultingQuantity,
      resultingReservedStock: data.resultingReservedStock,
      type: data.type
    },
    overrideAccess: true,
    req: { transactionID: data.transactionID } as never
  })
}

export async function reserveInventory(payload: Payload, lines: InventoryLine[], options: InventoryMutationOptions) {
  for (const line of sortedByProductId(lines)) {
    await lockRow(payload, options.transactionID, LOCK_NS.PRODUCT, Number(line.productId))

    const product = await getProduct(payload, line.productId, options.transactionID)
    const physicalStock = product.stockQuantity ?? 0
    const reservedStock = product.reservedStock ?? 0
    const available = physicalStock - reservedStock

    if (line.quantity < 1 || available < line.quantity) {
      throw new Error('INSUFFICIENT_STOCK')
    }

    const nextReservedStock = reservedStock + line.quantity

    await payload.update({
      collection: 'products',
      context: { skipStockMovement: true },
      data: {
        reservedStock: nextReservedStock,
        stockStatus: getStockStatus({ ...product, reservedStock: nextReservedStock })
      },
      id: product.id,
      overrideAccess: true,
      req: { transactionID: options.transactionID } as never
    })

    await writeMovement(payload, product, {
      adminId: options.adminId,
      note: options.note,
      orderId: options.orderId,
      previousQuantity: physicalStock,
      previousReservedStock: reservedStock,
      quantityDelta: line.quantity,
      reason: options.reason,
      resultingQuantity: physicalStock,
      resultingReservedStock: nextReservedStock,
      transactionID: options.transactionID,
      type: 'order_reservation'
    })
  }
}

export async function releaseInventoryReservation(payload: Payload, lines: InventoryLine[], options: InventoryMutationOptions) {
  for (const line of sortedByProductId(lines)) {
    await lockRow(payload, options.transactionID, LOCK_NS.PRODUCT, Number(line.productId))

    const product = await getProduct(payload, line.productId, options.transactionID)
    const physicalStock = product.stockQuantity ?? 0
    const reservedStock = product.reservedStock ?? 0
    const nextReservedStock = Math.max(0, reservedStock - line.quantity)

    await payload.update({
      collection: 'products',
      context: { skipStockMovement: true },
      data: {
        reservedStock: nextReservedStock,
        stockStatus: getStockStatus({ ...product, reservedStock: nextReservedStock })
      },
      id: product.id,
      overrideAccess: true,
      req: { transactionID: options.transactionID } as never
    })

    await writeMovement(payload, product, {
      adminId: options.adminId,
      note: options.note,
      orderId: options.orderId,
      previousQuantity: physicalStock,
      previousReservedStock: reservedStock,
      quantityDelta: -line.quantity,
      reason: options.reason,
      resultingQuantity: physicalStock,
      resultingReservedStock: nextReservedStock,
      transactionID: options.transactionID,
      type: 'reservation_release'
    })
  }
}

export async function fulfillReservedInventory(payload: Payload, lines: InventoryLine[], options: InventoryMutationOptions) {
  for (const line of sortedByProductId(lines)) {
    await lockRow(payload, options.transactionID, LOCK_NS.PRODUCT, Number(line.productId))

    const product = await getProduct(payload, line.productId, options.transactionID)
    const physicalStock = product.stockQuantity ?? 0
    const reservedStock = product.reservedStock ?? 0
    const nextPhysicalStock = Math.max(0, physicalStock - line.quantity)
    const nextReservedStock = Math.max(0, reservedStock - line.quantity)

    await payload.update({
      collection: 'products',
      context: { skipStockMovement: true },
      data: {
        reservedStock: nextReservedStock,
        stockQuantity: nextPhysicalStock,
        stockStatus: getStockStatus({ ...product, reservedStock: nextReservedStock, stockQuantity: nextPhysicalStock })
      },
      id: product.id,
      overrideAccess: true,
      req: { transactionID: options.transactionID } as never
    })

    await writeMovement(payload, product, {
      adminId: options.adminId,
      note: options.note,
      orderId: options.orderId,
      previousQuantity: physicalStock,
      previousReservedStock: reservedStock,
      quantityDelta: -line.quantity,
      reason: options.reason,
      resultingQuantity: nextPhysicalStock,
      resultingReservedStock: nextReservedStock,
      transactionID: options.transactionID,
      type: 'order_fulfillment'
    })
  }
}

/**
 * Restocks physical inventory from an accepted return. `reservedStock` is
 * untouched — a return has nothing reserved against it by the time goods are
 * physically back (that reservation was already released or fulfilled
 * earlier in the order's life).
 */
export async function restockInventory(payload: Payload, lines: InventoryLine[], options: InventoryMutationOptions) {
  for (const line of sortedByProductId(lines)) {
    await lockRow(payload, options.transactionID, LOCK_NS.PRODUCT, Number(line.productId))

    const product = await getProduct(payload, line.productId, options.transactionID)
    const physicalStock = product.stockQuantity ?? 0
    const reservedStock = product.reservedStock ?? 0
    const nextPhysicalStock = physicalStock + line.quantity

    await payload.update({
      collection: 'products',
      context: { skipStockMovement: true },
      data: {
        stockQuantity: nextPhysicalStock,
        stockStatus: getStockStatus({ ...product, stockQuantity: nextPhysicalStock })
      },
      id: product.id,
      overrideAccess: true,
      req: { transactionID: options.transactionID } as never
    })

    await writeMovement(payload, product, {
      adminId: options.adminId,
      note: options.note,
      orderId: options.orderId,
      previousQuantity: physicalStock,
      previousReservedStock: reservedStock,
      quantityDelta: line.quantity,
      reason: options.reason,
      resultingQuantity: nextPhysicalStock,
      resultingReservedStock: reservedStock,
      transactionID: options.transactionID,
      type: 'return'
    })
  }
}
