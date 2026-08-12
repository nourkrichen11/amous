import type { Payload, PayloadRequest } from 'payload'

type AuditInput = {
  adminId?: number | string
  entityId: number | string
  entityReference: string
  entityType: string
  event: string
  metadata?: Record<string, unknown>
  req?: PayloadRequest
  summary?: string
}

export async function createAuditLog(payload: Payload, input: AuditInput) {
  await payload.create({
    collection: 'audit-logs',
    data: {
      admin: input.adminId,
      entityId: String(input.entityId),
      entityReference: input.entityReference,
      entityType: input.entityType,
      event: input.event,
      metadata: input.metadata,
      summary: input.summary
    },
    overrideAccess: true,
    req: input.req
  })
}
