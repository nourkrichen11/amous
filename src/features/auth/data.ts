import { unstable_noStore as noStore } from 'next/cache'

import { getPayloadClient } from '@/lib/payload/getPayload'
import type { Locale } from '@/i18n/config'

import type { AuthUser } from './types'

export type CustomerOrderItem = {
  id: string
  quantity: number
  total: number
  unit: string
  unitPrice: number
  vatRate: number
  productName: string
  productSku: string
}

export type CustomerOrder = {
  createdAt?: string
  customerEmail: string
  deliveryCost: number
  id: string | number
  items: CustomerOrderItem[]
  locale: Locale
  orderNumber: string
  paymentStatus: string
  status: string
  total: number
}

function mapOrder(order: Record<string, unknown>): CustomerOrder {
  return {
    createdAt: typeof order.createdAt === 'string' ? order.createdAt : undefined,
    customerEmail: String(order.customerEmail || ''),
    deliveryCost: typeof order.deliveryCost === 'number' ? order.deliveryCost : 0,
    id: order.id as string | number,
    items: Array.isArray(order.items)
      ? order.items.map((item, index) => {
          const entry = item as Record<string, unknown>

          return {
            id: String(entry.id || index),
            productName: String(entry.productName || ''),
            productSku: String(entry.productSku || ''),
            quantity: typeof entry.quantity === 'number' ? entry.quantity : 0,
            total: typeof entry.lineTotal === 'number' ? entry.lineTotal : 0,
            unit: String(entry.unit || ''),
            unitPrice: typeof entry.unitPrice === 'number' ? entry.unitPrice : 0,
            vatRate: typeof entry.vatRate === 'number' ? entry.vatRate : 0
          }
        })
      : [],
    locale: order.locale === 'ar' ? 'ar' : 'fr',
    orderNumber: String(order.orderNumber || ''),
    paymentStatus: String(order.paymentStatus || ''),
    status: String(order.status || ''),
    total: typeof order.total === 'number' ? order.total : 0
  }
}

export async function getCustomerOrders(user: AuthUser): Promise<CustomerOrder[]> {
  noStore()

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'orders',
      depth: 1,
      limit: 50,
      overrideAccess: false,
      req: {
        user: {
          ...user,
          collection: 'users'
        }
      } as never,
      sort: '-createdAt'
    })

    return result.docs.map((doc) => mapOrder(doc as Record<string, unknown>))
  } catch {
    return []
  }
}

export async function getCustomerOrderByNumber(user: AuthUser, orderNumber: string): Promise<CustomerOrder | null> {
  noStore()

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'orders',
      depth: 1,
      limit: 1,
      overrideAccess: false,
      req: {
        user: {
          ...user,
          collection: 'users'
        }
      } as never,
      where: {
        orderNumber: {
          equals: orderNumber
        }
      }
    })

    const order = result.docs[0]
    return order ? mapOrder(order as Record<string, unknown>) : null
  } catch {
    return null
  }
}
