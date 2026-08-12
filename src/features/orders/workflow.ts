import type { Payload } from 'payload'

import { fulfillReservedInventory, releaseInventoryReservation } from '@/features/inventory/service'

import { createOrderEvent } from './events'
import type { ConfirmationStatus, FulfillmentStatus, OrderStatus, PaymentStatus } from './status'

type ID = string | number

type OrderLine = {
  product?: ID | { id: ID }
  quantity?: number
}

type OrderWorkflowDoc = {
  id: ID
  confirmationStatus?: ConfirmationStatus
  fulfillmentStatus?: FulfillmentStatus
  items?: OrderLine[]
  orderNumber?: string
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
}

function lineProductId(line: OrderLine) {
  return typeof line.product === 'object' && line.product ? line.product.id : line.product
}

function inventoryLines(order: OrderWorkflowDoc) {
  return (order.items ?? [])
    .map((line) => ({ productId: lineProductId(line), quantity: line.quantity ?? 0 }))
    .filter((line): line is { productId: ID; quantity: number } => Boolean(line.productId) && line.quantity > 0)
}

export async function updateOrderWorkflow(
  payload: Payload,
  order: OrderWorkflowDoc,
  updates: {
    adminId?: ID
    confirmationStatus?: ConfirmationStatus
    fulfillmentStatus?: FulfillmentStatus
    note?: string
    orderStatus?: OrderStatus
    paymentStatus?: PaymentStatus
  }
) {
  const transactionID = await payload.db.beginTransaction()
  const previousState = {
    confirmationStatus: order.confirmationStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus
  }
  const nextState = {
    confirmationStatus: updates.confirmationStatus ?? order.confirmationStatus,
    fulfillmentStatus: updates.fulfillmentStatus ?? order.fulfillmentStatus,
    orderStatus: updates.orderStatus ?? order.orderStatus,
    paymentStatus: updates.paymentStatus ?? order.paymentStatus
  }

  try {
    if (updates.orderStatus === 'cancelled') {
      await releaseInventoryReservation(payload, inventoryLines(order), {
        adminId: updates.adminId,
        orderId: order.id,
        reason: `Annulation commande ${order.orderNumber ?? order.id}`,
        transactionID: transactionID ?? undefined
      })
    }

    if (updates.fulfillmentStatus === 'shipped' || updates.fulfillmentStatus === 'delivered') {
      await fulfillReservedInventory(payload, inventoryLines(order), {
        adminId: updates.adminId,
        orderId: order.id,
        reason: `Preparation terminee ${order.orderNumber ?? order.id}`,
        transactionID: transactionID ?? undefined
      })
    }

    await payload.update({
      collection: 'orders',
      data: nextState,
      id: order.id,
      overrideAccess: true,
      req: transactionID ? ({ transactionID } as never) : undefined
    })

    await createOrderEvent(payload, {
      adminId: updates.adminId,
      eventType: 'order_status_changed',
      newState: nextState,
      note: updates.note,
      orderId: order.id,
      previousState,
      transactionID: transactionID ?? undefined
    })

    if (transactionID) {
      await payload.db.commitTransaction(transactionID)
    }
  } catch (error) {
    if (transactionID) {
      await payload.db.rollbackTransaction(transactionID)
    }

    throw error
  }
}
