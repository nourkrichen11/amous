import type { Payload } from 'payload'

import { lockRow, LOCK_NS } from '@/features/db/advisoryLock'
import { restockInventory } from '@/features/inventory/service'
import { applyOrderAction } from '@/features/orders/workflow'

type ID = string | number

type ReturnLine = {
  id?: string
  product?: ID | { id: ID }
  quantity?: number
  restoreToStock?: boolean
  restocked?: boolean
}

export type ReturnWorkflowDoc = {
  id: ID
  items?: ReturnLine[]
  order?: ID | { id: ID; items?: Array<{ product?: ID | { id: ID }; quantity?: number }> }
  returnNumber?: string
  status?: 'approved' | 'completed' | 'received' | 'rejected' | 'requested'
}

export type ReturnWorkflowAction = { type: 'approve' | 'complete' | 'receive' | 'reject' }

function lineProductId(value: ID | { id: ID } | undefined) {
  return typeof value === 'object' && value ? value.id : value
}

function orderId(ret: ReturnWorkflowDoc) {
  return typeof ret.order === 'object' && ret.order ? ret.order.id : ret.order
}

/**
 * `restocked` (a new field on `Returns.items[]`, see migration) is the only
 * reliable "already happened" fact here — unlike Orders, this can't be
 * derived from the Return's own `status` (document-level, not per-line) or
 * from the StockMovements ledger (append-only, no uniqueness guarantee, so
 * querying it for "has this happened" would itself be racy).
 */
function restockableLines(ret: ReturnWorkflowDoc) {
  return (ret.items ?? [])
    .filter((line) => line.restoreToStock && !line.restocked)
    .map((line) => ({ id: line.id, productId: lineProductId(line.product), quantity: line.quantity ?? 0 }))
    .filter((line): line is { id: string | undefined; productId: ID; quantity: number } => Boolean(line.productId) && line.quantity > 0)
}

/**
 * Detects whether every line of the parent order has now been fully
 * returned across all `completed` returns for that order (including the one
 * just completed), so the order can be rolled up to `orderStatus: 'returned'`.
 * A partial return leaves the order's `orderStatus` untouched — there is no
 * "partially returned" value in that enum, an intentional simplification of
 * the existing schema, not a gap.
 */
async function isFullOrderReturn(payload: Payload, orderDoc: NonNullable<ReturnWorkflowDoc['order']>, transactionID: number | string) {
  if (typeof orderDoc !== 'object') {
    return false
  }

  const orderedByProduct = new Map<string, number>()
  for (const line of orderDoc.items ?? []) {
    const id = lineProductId(line.product)
    if (!id) continue
    orderedByProduct.set(String(id), (orderedByProduct.get(String(id)) ?? 0) + (line.quantity ?? 0))
  }

  if (orderedByProduct.size === 0) {
    return false
  }

  const completedReturns = await payload.find({
    collection: 'returns',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req: { transactionID } as never,
    where: { and: [{ order: { equals: orderDoc.id } }, { status: { equals: 'completed' } }] }
  })

  const returnedByProduct = new Map<string, number>()
  for (const doc of completedReturns.docs as ReturnWorkflowDoc[]) {
    for (const line of doc.items ?? []) {
      const id = lineProductId(line.product)
      if (!id) continue
      returnedByProduct.set(String(id), (returnedByProduct.get(String(id)) ?? 0) + (line.quantity ?? 0))
    }
  }

  for (const [productId, orderedQuantity] of orderedByProduct) {
    if ((returnedByProduct.get(productId) ?? 0) < orderedQuantity) {
      return false
    }
  }

  return true
}

export async function applyReturnAction(
  payload: Payload,
  returnId: ID,
  action: ReturnWorkflowAction,
  ctx: { adminId?: ID; note?: string } = {}
): Promise<{ changed: boolean; ok: true; ret: ReturnWorkflowDoc }> {
  const transactionID = await payload.db.beginTransaction()

  if (transactionID == null) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  try {
    await lockRow(payload, transactionID, LOCK_NS.RETURN, Number(returnId))

    const ret = (await payload.findByID({
      collection: 'returns',
      id: returnId,
      depth: 1,
      overrideAccess: true,
      req: { transactionID } as never
    })) as ReturnWorkflowDoc | null

    if (!ret) {
      throw new Error('ORDER_NOT_FOUND')
    }

    const status = ret.status ?? 'requested'

    if (action.type === 'approve') {
      if (status === 'approved') {
        await payload.db.commitTransaction(transactionID)
        return { changed: false, ok: true, ret }
      }
      if (status !== 'requested') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }
      await payload.update({
        collection: 'returns',
        id: returnId,
        context: { fromWorkflowService: true },
        data: { status: 'approved' },
        overrideAccess: true,
        req: { transactionID } as never
      })
      await payload.db.commitTransaction(transactionID)
      return { changed: true, ok: true, ret: { ...ret, status: 'approved' } }
    }

    if (action.type === 'reject') {
      if (status === 'rejected') {
        await payload.db.commitTransaction(transactionID)
        return { changed: false, ok: true, ret }
      }
      if (status === 'received' || status === 'completed') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }
      await payload.update({
        collection: 'returns',
        id: returnId,
        context: { fromWorkflowService: true },
        data: { status: 'rejected' },
        overrideAccess: true,
        req: { transactionID } as never
      })
      await payload.db.commitTransaction(transactionID)
      return { changed: true, ok: true, ret: { ...ret, status: 'rejected' } }
    }

    if (action.type === 'receive') {
      if (status === 'received' || status === 'completed') {
        await payload.db.commitTransaction(transactionID)
        return { changed: false, ok: true, ret }
      }
      if (status === 'rejected') {
        throw new Error('INVALID_ORDER_TRANSITION')
      }

      const eligible = restockableLines(ret)

      if (eligible.length > 0) {
        await restockInventory(
          payload,
          eligible.map((line) => ({ productId: line.productId, quantity: line.quantity })),
          { adminId: ctx.adminId, orderId: orderId(ret), reason: `Retour ${ret.returnNumber ?? ret.id}`, transactionID }
        )
      }

      const eligibleIds = new Set(eligible.map((line) => line.id))
      const updatedItems = (ret.items ?? []).map((line) => (eligibleIds.has(line.id) ? { ...line, restocked: true } : line))

      await payload.update({
        collection: 'returns',
        id: returnId,
        context: { fromWorkflowService: true },
        data: { items: updatedItems, status: 'received' },
        overrideAccess: true,
        req: { transactionID } as never
      })

      await payload.db.commitTransaction(transactionID)
      return { changed: true, ok: true, ret: { ...ret, items: updatedItems, status: 'received' } }
    }

    // action.type === 'complete'
    if (status === 'completed') {
      await payload.db.commitTransaction(transactionID)
      return { changed: false, ok: true, ret }
    }
    if (status !== 'received') {
      throw new Error('INVALID_ORDER_TRANSITION')
    }

    await payload.update({
      collection: 'returns',
      id: returnId,
      context: { fromWorkflowService: true },
      data: { status: 'completed' },
      overrideAccess: true,
      req: { transactionID } as never
    })

    const parentOrder = ret.order
    if (parentOrder && typeof parentOrder === 'object' && (await isFullOrderReturn(payload, parentOrder, transactionID))) {
      await applyOrderAction(payload, parentOrder.id, { returnId: ret.id, type: 'return' }, ctx, transactionID)
    }

    await payload.db.commitTransaction(transactionID)
    return { changed: true, ok: true, ret: { ...ret, status: 'completed' } }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
