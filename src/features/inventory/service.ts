import type { Payload } from 'payload'

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
  transactionID?: number | string | Promise<number | string>
}

async function getProduct(payload: Payload, productId: ID, transactionID?: InventoryMutationOptions['transactionID']) {
  return (await payload.findByID({
    collection: 'products',
    id: productId,
    overrideAccess: true,
    req: transactionID ? ({ transactionID } as never) : undefined
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
    transactionID?: InventoryMutationOptions['transactionID']
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
    req: data.transactionID ? ({ transactionID: data.transactionID } as never) : undefined
  })
}

export async function reserveInventory(payload: Payload, lines: InventoryLine[], options: InventoryMutationOptions) {
  for (const line of lines) {
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
      req: options.transactionID ? ({ transactionID: options.transactionID } as never) : undefined
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
  for (const line of lines) {
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
      req: options.transactionID ? ({ transactionID: options.transactionID } as never) : undefined
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
  for (const line of lines) {
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
      req: options.transactionID ? ({ transactionID: options.transactionID } as never) : undefined
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
