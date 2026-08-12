import { getPayloadClient } from '@/lib/payload/getPayload'

export type AdminTopbarAlert = {
  count: number
  href: string
  label: string
  tone: 'danger' | 'info' | 'warning'
}

export type AdminTopbarSearchResult = {
  href: string
  id: string
  label: string
  meta?: string
  type: 'customer' | 'order' | 'product'
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function getAdminTopbarAlerts(): Promise<AdminTopbarAlert[]> {
  const payload = await getPayloadClient()
  const [toConfirm, toPrepare, toShip, lowStock, failedDeliveries] = await Promise.all([
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
    payload.count({
      collection: 'shipments',
      overrideAccess: true,
      where: { status: { equals: 'failed' } }
    })
  ])

  const alerts: AdminTopbarAlert[] = [
    {
      count: toConfirm.totalDocs,
      href: '/admin/collections/orders?where[confirmationStatus][equals]=pending',
      label: 'commandes a confirmer',
      tone: 'warning'
    },
    {
      count: toPrepare.totalDocs,
      href: '/admin/collections/orders?where[fulfillmentStatus][equals]=unfulfilled',
      label: 'commandes a preparer',
      tone: 'info'
    },
    {
      count: toShip.totalDocs,
      href: '/admin/collections/orders?where[fulfillmentStatus][equals]=ready_to_ship',
      label: 'commandes a expedier',
      tone: 'info'
    },
    {
      count: lowStock.totalDocs,
      href: '/admin/collections/products?where[stockStatus][equals]=low_stock',
      label: 'produits en stock faible',
      tone: 'danger'
    },
    {
      count: failedDeliveries.totalDocs,
      href: '/admin/collections/shipments?where[status][equals]=failed',
      label: 'echecs de livraison',
      tone: 'danger'
    }
  ]

  return alerts.filter((alert) => alert.count > 0)
}

export async function searchAdminEntities(query: string): Promise<AdminTopbarSearchResult[]> {
  const value = query.trim().slice(0, 80)

  if (value.length < 2) {
    return []
  }

  const payload = await getPayloadClient()
  const normalizedPhone = value.replaceAll(/\D/g, '')
  const [orders, products, customers] = await Promise.all([
    payload.find({
      collection: 'orders',
      depth: 0,
      limit: 5,
      overrideAccess: true,
      sort: '-createdAt',
      where: {
        or: [
          { orderNumber: { like: value } },
          { customerEmail: { like: value } },
          { customerFirstName: { like: value } },
          { customerLastName: { like: value } },
          ...(normalizedPhone ? [{ customerPhoneNormalized: { like: normalizedPhone } }] : [])
        ]
      }
    }),
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 5,
      overrideAccess: true,
      where: {
        or: [
          { name: { like: value } },
          { sku: { like: value } },
          { manufacturerReference: { like: value } }
        ]
      }
    }),
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 5,
      overrideAccess: true,
      where: {
        and: [
          { role: { equals: 'customer' } },
          {
            or: [
              { email: { like: value } },
              { firstName: { like: value } },
              { lastName: { like: value } },
              ...(normalizedPhone ? [{ normalizedPhone: { like: normalizedPhone } }] : [])
            ]
          }
        ]
      }
    })
  ])

  return [
    ...orders.docs.map((order) => {
      const entry = order as Record<string, unknown>
      const firstName = text(entry.customerFirstName)
      const lastName = text(entry.customerLastName)
      const contact = [firstName, lastName].filter(Boolean).join(' ') || text(entry.customerEmail) || text(entry.customerPhone)

      return {
        href: `/admin/collections/orders/${String(entry.id)}`,
        id: `order-${String(entry.id)}`,
        label: text(entry.orderNumber) || `Commande ${String(entry.id)}`,
        meta: contact || undefined,
        type: 'order' as const
      }
    }),
    ...products.docs.map((product) => {
      const entry = product as Record<string, unknown>
      const sku = text(entry.sku)
      const reference = text(entry.manufacturerReference)

      return {
        href: `/admin/collections/products/${String(entry.id)}`,
        id: `product-${String(entry.id)}`,
        label: text(entry.name) || `Produit ${String(entry.id)}`,
        meta: sku || reference || undefined,
        type: 'product' as const
      }
    }),
    ...customers.docs.map((customer) => {
      const entry = customer as Record<string, unknown>
      const name = [text(entry.firstName), text(entry.lastName)].filter(Boolean).join(' ')

      return {
        href: `/admin/collections/users/${String(entry.id)}`,
        id: `customer-${String(entry.id)}`,
        label: name || text(entry.email) || `Client ${String(entry.id)}`,
        meta: text(entry.phone) || text(entry.email) || undefined,
        type: 'customer' as const
      }
    })
  ]
}
