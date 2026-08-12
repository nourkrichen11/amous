import type { Payload } from 'payload'

type ID = string | number

export async function createOrderEvent(
  payload: Payload,
  input: {
    adminId?: ID
    eventType: string
    metadata?: Record<string, unknown>
    newState?: Record<string, unknown>
    note?: string
    orderId: ID
    previousState?: Record<string, unknown>
    transactionID?: number | string | Promise<number | string>
  }
) {
  await payload.create({
    collection: 'order-events',
    data: {
      admin: input.adminId,
      eventType: input.eventType,
      metadata: input.metadata,
      newState: input.newState,
      note: input.note,
      order: input.orderId,
      previousState: input.previousState
    },
    overrideAccess: true,
    req: input.transactionID ? ({ transactionID: input.transactionID } as never) : undefined
  })
}
