import { describe, expect, it } from 'vitest'

import { decide, type OrderWorkflowDoc } from './workflow'

function order(overrides: Partial<OrderWorkflowDoc> = {}): OrderWorkflowDoc {
  return {
    confirmationStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    id: 1,
    items: [{ product: 1, quantity: 2 }],
    orderNumber: 'AM-2026-000001',
    orderStatus: 'new',
    paymentStatus: 'unpaid',
    total: 1000,
    ...overrides
  }
}

describe('decide — confirm', () => {
  it('confirms a pending order and advances orderStatus to processing', () => {
    const decision = decide(order(), { type: 'confirm' })
    expect(decision).toMatchObject({
      changed: true,
      nextState: { confirmationStatus: 'confirmed', orderStatus: 'processing' }
    })
  })

  it('is a no-op when already confirmed', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed' }), { type: 'confirm' })
    expect(decision).toEqual({ changed: false })
  })

  it('rejects confirming a cancelled order', () => {
    expect(() => decide(order({ orderStatus: 'cancelled' }), { type: 'confirm' })).toThrow('INVALID_ORDER_TRANSITION')
  })
})

describe('decide — cancel / reject', () => {
  it('cancels a new order and releases inventory', () => {
    const decision = decide(order(), { type: 'cancel' })
    expect(decision).toMatchObject({ changed: true, inventoryEffect: 'release', nextState: { orderStatus: 'cancelled' } })
  })

  it('cancelling twice is idempotent', () => {
    expect(decide(order({ orderStatus: 'cancelled' }), { type: 'cancel' })).toEqual({ changed: false })
  })

  it('cannot cancel a shipped order', () => {
    expect(() => decide(order({ fulfillmentStatus: 'shipped' }), { type: 'cancel' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('cannot cancel a delivered order', () => {
    expect(() => decide(order({ fulfillmentStatus: 'delivered', orderStatus: 'completed' }), { type: 'cancel' })).toThrow(
      'INVALID_ORDER_TRANSITION'
    )
  })

  it('cannot cancel a completed order', () => {
    expect(() => decide(order({ orderStatus: 'completed' }), { type: 'cancel' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('cancel keeps confirmationStatus confirmed once already confirmed (confirmation is historical)', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed' }), { type: 'cancel' })
    expect(decision).toMatchObject({ nextState: { confirmationStatus: 'confirmed', orderStatus: 'cancelled' } })
  })

  it('reject sets confirmationStatus to cancelled pre-confirmation', () => {
    const decision = decide(order(), { type: 'reject' })
    expect(decision).toMatchObject({ nextState: { confirmationStatus: 'cancelled', orderStatus: 'cancelled' } })
  })

  it('cannot reject an already-confirmed order', () => {
    expect(() => decide(order({ confirmationStatus: 'confirmed' }), { type: 'reject' })).toThrow('INVALID_ORDER_TRANSITION')
  })
})

describe('decide — start_fulfillment', () => {
  it('requires confirmation first', () => {
    expect(() => decide(order(), { type: 'start_fulfillment' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('moves unfulfilled to preparing once confirmed', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed' }), { type: 'start_fulfillment' })
    expect(decision).toMatchObject({ changed: true, nextState: { fulfillmentStatus: 'preparing' } })
  })

  it('is a no-op once already past unfulfilled', () => {
    expect(decide(order({ confirmationStatus: 'confirmed', fulfillmentStatus: 'preparing' }), { type: 'start_fulfillment' })).toEqual({
      changed: false
    })
  })
})

describe('decide — fulfill', () => {
  it('deducts inventory on first crossing into shipped', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed', fulfillmentStatus: 'preparing' }), {
      stage: 'shipped',
      type: 'fulfill'
    })
    expect(decision).toMatchObject({ changed: true, inventoryEffect: 'fulfill', nextState: { fulfillmentStatus: 'shipped' } })
  })

  it('does NOT deduct inventory a second time when progressing shipped -> delivered (regression: old dead code double-deducted here)', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed', fulfillmentStatus: 'shipped' }), {
      stage: 'delivered',
      type: 'fulfill'
    })
    expect(decision).toMatchObject({ changed: true, inventoryEffect: null })
  })

  it('marks the order completed and paid on delivery for a COD order', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed', fulfillmentStatus: 'shipped' }), {
      stage: 'delivered',
      type: 'fulfill'
    })
    expect(decision).toMatchObject({ nextState: { orderStatus: 'completed', paymentStatus: 'paid' } })
  })

  it('is idempotent when calling fulfill delivered twice', () => {
    const decision = decide(order({ fulfillmentStatus: 'delivered', orderStatus: 'completed' }), {
      stage: 'delivered',
      type: 'fulfill'
    })
    expect(decision).toEqual({ changed: false })
  })

  it('allows skipping ahead from preparing directly to delivered', () => {
    const decision = decide(order({ confirmationStatus: 'confirmed', fulfillmentStatus: 'preparing' }), {
      stage: 'delivered',
      type: 'fulfill'
    })
    expect(decision).toMatchObject({ inventoryEffect: 'fulfill' })
  })

  it('rejects fulfilling a cancelled order', () => {
    expect(() => decide(order({ orderStatus: 'cancelled' }), { stage: 'shipped', type: 'fulfill' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('rejects going backward from shipped to ready_to_ship (idempotent no-op, not an error)', () => {
    expect(decide(order({ fulfillmentStatus: 'shipped' }), { stage: 'ready_to_ship', type: 'fulfill' })).toEqual({ changed: false })
  })
})

describe('decide — mark_paid', () => {
  it('marks unpaid as paid', () => {
    expect(decide(order(), { type: 'mark_paid' })).toMatchObject({ changed: true, nextState: { paymentStatus: 'paid' } })
  })

  it('is idempotent when already paid', () => {
    expect(decide(order({ paymentStatus: 'paid' }), { type: 'mark_paid' })).toEqual({ changed: false })
  })

  it('treats the legacy cash_on_delivery alias as payable', () => {
    expect(decide(order({ paymentStatus: 'cash_on_delivery' as never }), { type: 'mark_paid' })).toMatchObject({ changed: true })
  })

  it('cannot mark a refunded order paid', () => {
    expect(() => decide(order({ paymentStatus: 'refunded' }), { type: 'mark_paid' })).toThrow('INVALID_ORDER_TRANSITION')
  })
})

describe('decide — refund', () => {
  it('rejects refunding an unpaid order', () => {
    expect(() => decide(order(), { amount: 100, full: false, type: 'refund' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('records a partial refund within balance', () => {
    const decision = decide(order({ paymentStatus: 'paid', total: 1000 }), { amount: 400, full: false, type: 'refund' })
    expect(decision).toMatchObject({
      changed: true,
      eventMetadata: { amount: 400 },
      nextState: { paymentStatus: 'partially_refunded' }
    })
  })

  it('records a full refund', () => {
    const decision = decide(order({ paymentStatus: 'paid', total: 1000 }), { amount: 1000, full: true, type: 'refund' })
    expect(decision).toMatchObject({ nextState: { paymentStatus: 'refunded' } })
  })

  it('rejects a refund that exceeds the remaining balance', () => {
    expect(() => decide(order({ paymentStatus: 'paid', total: 1000 }), { amount: 1001, full: false, type: 'refund' }, {})).toThrow(
      'REFUND_EXCEEDS_BALANCE'
    )
  })

  it('accounts for amounts already refunded', () => {
    expect(() =>
      decide(order({ paymentStatus: 'partially_refunded', total: 1000 }), { amount: 700, full: false, type: 'refund' }, { alreadyRefunded: 400 })
    ).toThrow('REFUND_EXCEEDS_BALANCE')
  })

  it('rejects a zero or negative refund amount', () => {
    expect(() => decide(order({ paymentStatus: 'paid' }), { amount: 0, full: false, type: 'refund' })).toThrow('VALIDATION_ERROR')
  })
})

describe('decide — return', () => {
  it('requires the order to be delivered first', () => {
    expect(() => decide(order(), { returnId: 1, type: 'return' })).toThrow('INVALID_ORDER_TRANSITION')
  })

  it('rolls the order up to returned once delivered', () => {
    const decision = decide(order({ fulfillmentStatus: 'delivered', orderStatus: 'completed' }), { returnId: 1, type: 'return' })
    expect(decision).toMatchObject({
      changed: true,
      inventoryEffect: null,
      nextState: { fulfillmentStatus: 'returned', orderStatus: 'returned' }
    })
  })

  it('is idempotent once already returned', () => {
    expect(decide(order({ fulfillmentStatus: 'returned', orderStatus: 'returned' }), { returnId: 1, type: 'return' })).toEqual({
      changed: false
    })
  })
})
