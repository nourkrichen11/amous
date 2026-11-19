import type { Payload } from 'payload'

import { lockRow, LOCK_NS } from '@/features/db/advisoryLock'
import { fulfillReservedInventory, releaseInventoryReservation } from '@/features/inventory/service'

import { createOrderEvent } from './events'
import { deriveLegacyStatus } from './status'
import type { ConfirmationStatus, FulfillmentStatus, OrderStatus, PaymentStatus } from './status'

type ID = string | number

type OrderLine = {
  product?: ID | { id: ID }
  quantity?: number
}

export type OrderWorkflowDoc = {
  id: ID
  confirmationStatus?: ConfirmationStatus
  fulfillmentStatus?: FulfillmentStatus
  items?: OrderLine[]
  orderNumber?: string
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
  statusTimestamps?: Record<string, unknown>
  total?: number
}

export type OrderWorkflowAction =
  | { type: 'confirm' }
  | { type: 'reject' }
  | { type: 'cancel' }
  | { type: 'start_fulfillment' }
  | { type: 'fulfill'; stage: 'ready_to_ship' | 'shipped' | 'delivered' }
  | { type: 'mark_paid' }
  | { type: 'refund'; amount: number; full: boolean }
  | { type: 'return'; returnId: ID }

type StatusPatch = Partial<
  Pick<OrderWorkflowDoc, 'confirmationStatus' | 'fulfillmentStatus' | 'orderStatus' | 'paymentStatus'>
>

type Decision =
  | { changed: false }
  | {
      changed: true
      eventMetadata?: Record<string, unknown>
      eventType: string
      inventoryEffect: 'fulfill' | 'release' | null
      nextState: StatusPatch
      timestampField?: 'cancelledAt' | 'confirmedAt' | 'deliveredAt' | 'shippedAt'
    }

const FULFILLMENT_RANK: Record<FulfillmentStatus, number> = {
  unfulfilled: 0,
  preparing: 1,
  ready_to_ship: 2,
  shipped: 3,
  delivered: 4,
  delivery_failed: 3,
  returned: 5
}

const PAYABLE_STATUSES: PaymentStatus[] = ['unpaid', 'pending']
// Legacy field-level options never exposed via `paymentStatusOptions` — see plan §1.
const LEGACY_UNPAID_ALIASES = ['cash_on_delivery', 'failed']

function lineProductId(line: OrderLine) {
  return typeof line.product === 'object' && line.product ? line.product.id : line.product
}

export function inventoryLines(order: OrderWorkflowDoc) {
  return (order.items ?? [])
    .map((line) => ({ productId: lineProductId(line), quantity: line.quantity ?? 0 }))
    .filter((line): line is { productId: ID; quantity: number } => Boolean(line.productId) && line.quantity > 0)
}

/**
 * Pure, synchronous transition reducer — no I/O, fully unit-testable. See
 * `workflow.test.ts` for the exhaustive transition-table coverage. Illegal
 * transitions throw `INVALID_ORDER_TRANSITION`; repeating an already-applied
 * action is a silent no-op (`{ changed: false }`), which is what makes
 * "cancel twice" / "fulfill twice" safe without a separate idempotency-key
 * field — the order's own current status *is* the idempotency check, and
 * `applyOrderAction` evaluates it only after acquiring the per-order lock.
 */
export function decide(order: OrderWorkflowDoc, action: OrderWorkflowAction, extra: { alreadyRefunded?: number } = {}): Decision {
  const orderStatus = order.orderStatus ?? 'new'
  const confirmationStatus = order.confirmationStatus ?? 'pending'
  const fulfillmentStatus = order.fulfillmentStatus ?? 'unfulfilled'
  const paymentStatus = order.paymentStatus ?? 'unpaid'

  switch (action.type) {
    case 'confirm': {
      if (orderStatus === 'cancelled' || orderStatus === 'returned') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      if (confirmationStatus === 'confirmed') {
        return { changed: false }
      }

      if (confirmationStatus === 'cancelled') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      return {
        changed: true,
        eventType: 'order_confirmed',
        inventoryEffect: null,
        nextState: {
          confirmationStatus: 'confirmed',
          orderStatus: orderStatus === 'new' ? 'processing' : orderStatus
        },
        timestampField: 'confirmedAt'
      }
    }

    case 'reject':
    case 'cancel': {
      if (orderStatus === 'cancelled') {
        return { changed: false }
      }

      if (orderStatus === 'completed' || orderStatus === 'returned') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      if (fulfillmentStatus === 'shipped' || fulfillmentStatus === 'delivered') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      if (action.type === 'reject' && confirmationStatus === 'confirmed') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      return {
        changed: true,
        eventType: action.type === 'reject' ? 'order_rejected' : 'order_cancelled',
        inventoryEffect: 'release',
        nextState: {
          confirmationStatus: confirmationStatus === 'confirmed' ? confirmationStatus : 'cancelled',
          orderStatus: 'cancelled'
        },
        timestampField: 'cancelledAt'
      }
    }

    case 'start_fulfillment': {
      if (confirmationStatus !== 'confirmed') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      if (fulfillmentStatus !== 'unfulfilled') {
        return { changed: false }
      }

      return {
        changed: true,
        eventType: 'fulfillment_started',
        inventoryEffect: null,
        nextState: { fulfillmentStatus: 'preparing' }
      }
    }

    case 'fulfill': {
      if (orderStatus === 'cancelled' || orderStatus === 'returned') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      const from = FULFILLMENT_RANK[fulfillmentStatus]
      const to = FULFILLMENT_RANK[action.stage]

      if (to <= from) {
        return { changed: false }
      }

      // First crossing into shipped/delivered is when reserved stock actually
      // leaves the building — a later `delivered` call after `shipped` must
      // NOT deduct a second time (the exact bug in the old dead code).
      const crossesIntoFulfilled = from < FULFILLMENT_RANK.shipped && to >= FULFILLMENT_RANK.shipped

      const nextState: StatusPatch = { fulfillmentStatus: action.stage }

      if (action.stage === 'delivered') {
        nextState.orderStatus = 'completed'

        if (paymentStatus === 'unpaid' || LEGACY_UNPAID_ALIASES.includes(paymentStatus)) {
          nextState.paymentStatus = 'paid'
        }
      }

      return {
        changed: true,
        eventType: `fulfillment_${action.stage}`,
        inventoryEffect: crossesIntoFulfilled ? 'fulfill' : null,
        nextState,
        timestampField: action.stage === 'shipped' ? 'shippedAt' : action.stage === 'delivered' ? 'deliveredAt' : undefined
      }
    }

    case 'mark_paid': {
      if (paymentStatus === 'paid') {
        return { changed: false }
      }

      if (!PAYABLE_STATUSES.includes(paymentStatus) && !LEGACY_UNPAID_ALIASES.includes(paymentStatus)) {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      return {
        changed: true,
        eventType: 'payment_recorded',
        inventoryEffect: null,
        nextState: { paymentStatus: 'paid' }
      }
    }

    case 'refund': {
      if (paymentStatus !== 'paid' && paymentStatus !== 'partially_refunded') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      const target = action.full ? 'refunded' : 'partially_refunded'

      // Note: repeating an identical-target partial refund is NOT treated as
      // an automatic duplicate no-op — a second, distinct partial refund is a
      // legitimate new event, distinguished by amount, not by target status.
      if (action.amount <= 0) {
        throw new Error('VALIDATION_ERROR')
      }

      const alreadyRefunded = extra.alreadyRefunded ?? 0
      const orderTotal = order.total ?? 0

      if (alreadyRefunded + action.amount > orderTotal) {
        throw new Error('REFUND_EXCEEDS_BALANCE')
      }

      return {
        changed: true,
        eventMetadata: { amount: action.amount },
        eventType: 'refund_recorded',
        inventoryEffect: null,
        nextState: { paymentStatus: target }
      }
    }

    case 'return': {
      if (orderStatus === 'returned') {
        return { changed: false }
      }

      if (fulfillmentStatus !== 'delivered') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      return {
        changed: true,
        eventMetadata: { returnId: action.returnId },
        eventType: 'order_returned',
        // Restocking is owned exclusively by the Returns workflow — this
        // transition only rolls the order's own status up.
        inventoryEffect: null,
        nextState: { fulfillmentStatus: 'returned', orderStatus: 'returned' }
      }
    }

    default: {
      throw new Error('VALIDATION_ERROR')
    }
  }
}

export type AvailableAction =
  | { type: 'confirm' }
  | { type: 'reject' }
  | { type: 'cancel' }
  | { type: 'start_fulfillment' }
  | { stage: 'ready_to_ship' | 'shipped' | 'delivered'; type: 'fulfill' }
  | { type: 'mark_paid' }
  | { type: 'refund' }
  | { type: 'return' }

/**
 * Lighter-weight, UI-facing legality check ("which buttons should be
 * enabled") — intentionally independent of `decide()`'s exact side-effect
 * bookkeeping (e.g. it doesn't need a refund amount to say "refund is
 * available"). The actual enforcement is always `decide()` + the guard hook,
 * never this helper.
 */
export function getAvailableActions(order: OrderWorkflowDoc): AvailableAction[] {
  const orderStatus = order.orderStatus ?? 'new'
  const confirmationStatus = order.confirmationStatus ?? 'pending'
  const fulfillmentStatus = order.fulfillmentStatus ?? 'unfulfilled'
  const paymentStatus = order.paymentStatus ?? 'unpaid'
  const actions: AvailableAction[] = []

  const terminal = orderStatus === 'cancelled' || orderStatus === 'returned'
  const goodsLeftWarehouse = fulfillmentStatus === 'shipped' || fulfillmentStatus === 'delivered'

  // Mirrors `decide()`'s own legality rules exactly (rather than
  // reconstructing them independently) to avoid the UI offering an action
  // that would then fail — e.g. previously this could offer "Confirm" on an
  // order whose confirmation had already been rejected.
  if (!terminal && (confirmationStatus === 'pending' || confirmationStatus === 'unreachable')) {
    actions.push({ type: 'confirm' })
  }

  if (!terminal && !goodsLeftWarehouse && confirmationStatus !== 'confirmed' && confirmationStatus !== 'cancelled') {
    actions.push({ type: 'reject' })
  }

  if (orderStatus !== 'cancelled' && orderStatus !== 'completed' && orderStatus !== 'returned' && !goodsLeftWarehouse) {
    actions.push({ type: 'cancel' })
  }

  if (!terminal) {
    if (confirmationStatus === 'confirmed' && fulfillmentStatus === 'unfulfilled') {
      actions.push({ type: 'start_fulfillment' })
    }

    const from = FULFILLMENT_RANK[fulfillmentStatus]
    for (const stage of ['ready_to_ship', 'shipped', 'delivered'] as const) {
      if (FULFILLMENT_RANK[stage] > from) {
        actions.push({ stage, type: 'fulfill' })
      }
    }
  }

  if (paymentStatus !== 'paid' && (PAYABLE_STATUSES.includes(paymentStatus) || LEGACY_UNPAID_ALIASES.includes(paymentStatus))) {
    actions.push({ type: 'mark_paid' })
  }

  if (paymentStatus === 'paid' || paymentStatus === 'partially_refunded') {
    actions.push({ type: 'refund' })
  }

  if (fulfillmentStatus === 'delivered' && orderStatus !== 'returned') {
    actions.push({ type: 'return' })
  }

  return actions
}

/**
 * The single entry point for every order-status mutation, storefront or
 * admin. Runs inside its own real Postgres transaction: locks the order row
 * first (so two concurrent actions on the same order can't race), re-reads
 * fresh state under that lock (the idempotency check), applies inventory
 * side effects, updates the order (tagged `fromWorkflowService` so the guard
 * hook on `Orders` lets the write through), and records an `OrderEvent` —
 * all atomically.
 */
export async function applyOrderAction(
  payload: Payload,
  orderId: ID,
  action: OrderWorkflowAction,
  ctx: { adminId?: ID; note?: string } = {},
  /**
   * Pass an already-open transaction id (e.g. from the Returns workflow's
   * own `beginTransaction()`) to participate in it atomically instead of
   * opening a second, independent one — avoids a nested-transaction
   * deadlock/non-atomicity risk when one workflow needs to trigger another.
   */
  existingTransactionID?: number | string
): Promise<{ changed: boolean; ok: true; order: OrderWorkflowDoc }> {
  const ownsTransaction = existingTransactionID == null
  const transactionID = existingTransactionID ?? (await payload.db.beginTransaction())

  if (transactionID == null) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  try {
    await lockRow(payload, transactionID, LOCK_NS.ORDER, Number(orderId))

    const order = (await payload.findByID({
      collection: 'orders',
      id: orderId,
      overrideAccess: true,
      req: { transactionID } as never
    })) as OrderWorkflowDoc | null

    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    let alreadyRefunded = 0

    if (action.type === 'refund') {
      const events = await payload.find({
        collection: 'order-events',
        overrideAccess: true,
        pagination: false,
        req: { transactionID } as never,
        where: {
          and: [{ order: { equals: orderId } }, { eventType: { equals: 'refund_recorded' } }]
        }
      })

      alreadyRefunded = events.docs.reduce((sum, doc) => {
        const metadata = doc.metadata as { amount?: number } | null | undefined
        return sum + (typeof metadata?.amount === 'number' ? metadata.amount : 0)
      }, 0)
    }

    const decision = decide(order, action, { alreadyRefunded })

    if (!decision.changed) {
      if (ownsTransaction) {
        await payload.db.commitTransaction(transactionID)
      }
      return { changed: false, ok: true, order }
    }

    if (decision.inventoryEffect === 'release') {
      await releaseInventoryReservation(payload, inventoryLines(order), {
        adminId: ctx.adminId,
        orderId: order.id,
        reason: `${action.type === 'reject' ? 'Rejet' : 'Annulation'} commande ${order.orderNumber ?? order.id}`,
        transactionID
      })
    }

    if (decision.inventoryEffect === 'fulfill') {
      await fulfillReservedInventory(payload, inventoryLines(order), {
        adminId: ctx.adminId,
        orderId: order.id,
        reason: `Expedition commande ${order.orderNumber ?? order.id}`,
        transactionID
      })
    }

    const nextTimestamps = decision.timestampField
      ? { ...(order.statusTimestamps ?? {}), [decision.timestampField]: new Date().toISOString() }
      : order.statusTimestamps

    const updated = (await payload.update({
      collection: 'orders',
      id: orderId,
      context: { fromWorkflowService: true },
      data: {
        ...decision.nextState,
        status: deriveLegacyStatus({ ...order, ...decision.nextState }),
        statusTimestamps: nextTimestamps
      },
      overrideAccess: true,
      req: { transactionID } as never
    })) as OrderWorkflowDoc

    await createOrderEvent(payload, {
      adminId: ctx.adminId,
      eventType: decision.eventType,
      metadata: decision.eventMetadata,
      newState: decision.nextState,
      note: ctx.note,
      orderId: order.id,
      previousState: {
        confirmationStatus: order.confirmationStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      },
      transactionID
    })

    if (ownsTransaction) {
      await payload.db.commitTransaction(transactionID)
    }

    return { changed: true, ok: true, order: updated }
  } catch (error) {
    if (ownsTransaction) {
      await payload.db.rollbackTransaction(transactionID)
    }
    throw error
  }
}
