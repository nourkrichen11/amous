import { getPayloadClient } from '@/lib/payload/getPayload'

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export async function getAdminDashboardData() {
  const payload = await getPayloadClient()
  const today = startOfToday()
  const [ordersToday, revenueToday, toConfirm, toPrepare, toShip, lowStock, recentOrders] = await Promise.all([
    payload.count({
      collection: 'orders',
      overrideAccess: true,
      where: { createdAt: { greater_than_equal: today } }
    }),
    payload.find({
      collection: 'orders',
      limit: 100,
      overrideAccess: true,
      where: { createdAt: { greater_than_equal: today } }
    }),
    payload.count({
      collection: 'orders',
      overrideAccess: true,
      where: { confirmationStatus: { equals: 'pending' } }
    }),
    payload.count({
      collection: 'orders',
      overrideAccess: true,
      where: { fulfillmentStatus: { equals: 'unfulfilled' } }
    }),
    payload.count({
      collection: 'orders',
      overrideAccess: true,
      where: { fulfillmentStatus: { equals: 'ready_to_ship' } }
    }),
    payload.count({
      collection: 'products',
      overrideAccess: true,
      where: { stockStatus: { equals: 'low_stock' } }
    }),
    payload.find({
      collection: 'orders',
      depth: 0,
      limit: 8,
      overrideAccess: true,
      sort: '-createdAt'
    })
  ])

  return {
    lowStock: lowStock.totalDocs,
    ordersToday: ordersToday.totalDocs,
    recentOrders: recentOrders.docs as Array<Record<string, unknown>>,
    revenueToday: revenueToday.docs.reduce((sum, order) => {
      const total = (order as unknown as { total?: unknown }).total
      return sum + (typeof total === 'number' ? total : 0)
    }, 0),
    toConfirm: toConfirm.totalDocs,
    toPrepare: toPrepare.totalDocs,
    toShip: toShip.totalDocs
  }
}
