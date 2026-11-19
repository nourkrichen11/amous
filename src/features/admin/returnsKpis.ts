import { getPayloadClient } from '@/lib/payload/getPayload'

/** Three cheap counts, no aggregation beyond payload.count — same pattern as getAdminDashboardData. */
export async function getReturnsListKpis() {
  const payload = await getPayloadClient()
  const [requested, toProcess, received] = await Promise.all([
    payload.count({ collection: 'returns', overrideAccess: true, where: { status: { equals: 'requested' } } }),
    payload.count({ collection: 'returns', overrideAccess: true, where: { status: { in: ['requested', 'approved'] } } }),
    payload.count({ collection: 'returns', overrideAccess: true, where: { status: { equals: 'received' } } })
  ])

  return {
    received: received.totalDocs,
    requested: requested.totalDocs,
    toProcess: toProcess.totalDocs
  }
}
