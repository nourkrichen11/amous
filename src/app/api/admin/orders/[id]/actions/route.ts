import { NextResponse } from 'next/server'

import { requireAdminAccess } from '@/features/auth/session'
import type { OrderWorkflowAction } from '@/features/orders/workflow'
import { applyOrderAction } from '@/features/orders/workflow'
import { getPayloadClient } from '@/lib/payload/getPayload'

type RouteProps = {
  params: Promise<{ id: string }>
}

const ACTION_TYPES = new Set(['confirm', 'reject', 'cancel', 'start_fulfillment', 'fulfill', 'mark_paid', 'refund', 'return'])

const ERROR_STATUS: Record<string, number> = {
  IDEMPOTENCY_CONFLICT: 409,
  INSUFFICIENT_STOCK: 409,
  INVALID_ORDER_TRANSITION: 409,
  NO_ACTIVE_TRANSACTION: 500,
  ORDER_NOT_FOUND: 404,
  REFUND_EXCEEDS_BALANCE: 409,
  VALIDATION_ERROR: 400
}

function parseAction(body: unknown): OrderWorkflowAction | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const { action, amount, full, returnId, stage } = body as Record<string, unknown>

  if (typeof action !== 'string' || !ACTION_TYPES.has(action)) {
    return null
  }

  if (action === 'fulfill') {
    if (stage !== 'ready_to_ship' && stage !== 'shipped' && stage !== 'delivered') {
      return null
    }
    return { stage, type: 'fulfill' }
  }

  if (action === 'refund') {
    if (typeof amount !== 'number' || amount <= 0) {
      return null
    }
    return { amount, full: Boolean(full), type: 'refund' }
  }

  if (action === 'return') {
    if (typeof returnId !== 'string' && typeof returnId !== 'number') {
      return null
    }
    return { returnId, type: 'return' }
  }

  return { type: action } as OrderWorkflowAction
}

export async function POST(request: Request, { params }: RouteProps) {
  const { error, user } = await requireAdminAccess()

  if (error) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: error.status })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const action = parseAction(body)

  if (!action) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Action invalide.' }, { status: 400 })
  }

  const note = body && typeof body === 'object' && typeof (body as Record<string, unknown>).note === 'string' ? (body as Record<string, unknown>).note as string : undefined

  try {
    const payload = await getPayloadClient()
    const result = await applyOrderAction(payload, id, action, { adminId: user?.id, note })

    return NextResponse.json({ action: action.type, changed: result.changed, ok: true, orderId: id })
  } catch (thrown) {
    const code = thrown instanceof Error ? thrown.message : 'UNKNOWN_ERROR'
    const status = ERROR_STATUS[code] ?? 500

    return NextResponse.json(
      { code, message: status === 500 ? 'Une erreur inattendue est survenue.' : code },
      { status }
    )
  }
}
