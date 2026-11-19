import { NextResponse } from 'next/server'

import { requireAdminAccess } from '@/features/auth/session'
import type { ReturnWorkflowAction } from '@/features/returns/workflow'
import { applyReturnAction } from '@/features/returns/workflow'
import { getPayloadClient } from '@/lib/payload/getPayload'

type RouteProps = {
  params: Promise<{ id: string }>
}

const ACTION_TYPES = new Set(['approve', 'reject', 'receive', 'complete'])

const ERROR_STATUS: Record<string, number> = {
  INVALID_ORDER_TRANSITION: 409,
  NO_ACTIVE_TRANSACTION: 500,
  ORDER_NOT_FOUND: 404,
  VALIDATION_ERROR: 400
}

export async function POST(request: Request, { params }: RouteProps) {
  const { error, user } = await requireAdminAccess()

  if (error) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: error.status })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const actionType = body && typeof body === 'object' ? (body as Record<string, unknown>).action : undefined

  if (typeof actionType !== 'string' || !ACTION_TYPES.has(actionType)) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'Action invalide.' }, { status: 400 })
  }

  const note = body && typeof body === 'object' && typeof (body as Record<string, unknown>).note === 'string' ? (body as Record<string, unknown>).note as string : undefined
  const action = { type: actionType } as ReturnWorkflowAction

  try {
    const payload = await getPayloadClient()
    const result = await applyReturnAction(payload, id, action, { adminId: user?.id, note })

    return NextResponse.json({ action: actionType, changed: result.changed, ok: true, returnId: id })
  } catch (thrown) {
    const code = thrown instanceof Error ? thrown.message : 'UNKNOWN_ERROR'
    const status = ERROR_STATUS[code] ?? 500

    return NextResponse.json(
      { code, message: status === 500 ? 'Une erreur inattendue est survenue.' : code },
      { status }
    )
  }
}
