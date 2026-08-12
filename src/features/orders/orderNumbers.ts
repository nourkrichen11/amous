import type { Payload } from 'payload'

export async function makeCommercialOrderNumber(payload: Payload, date = new Date()) {
  const year = date.getFullYear()
  const prefix = `AM-${year}-`
  const latest = await payload.find({
    collection: 'orders',
    limit: 1,
    overrideAccess: true,
    sort: '-orderNumber',
    where: {
      orderNumber: {
        like: prefix
      }
    }
  })
  const latestNumber = String((latest.docs[0] as { orderNumber?: string } | undefined)?.orderNumber ?? '')
  const suffix = latestNumber.startsWith(prefix) ? Number(latestNumber.slice(prefix.length)) : 0
  const next = Number.isFinite(suffix) ? suffix + 1 : 1

  return `${prefix}${String(next).padStart(6, '0')}`
}
