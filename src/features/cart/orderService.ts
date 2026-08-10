import { randomBytes } from 'node:crypto'

import type { Locale } from '@/i18n/config'
import type { AuthUser } from '@/features/auth/types'
import { calculateDeliveryFee, getDeliveryConfig } from '@/features/cart/delivery'
import type { CheckoutInput } from '@/features/cart/validation'
import { calculateTotals } from '@/lib/money'
import { getPayloadClient } from '@/lib/payload/getPayload'

import { findCartByIdentifier, markCartConverted, validateCart } from './service'

type OrderResult =
  | {
      ok: true
      orderNumber: string
      token: string
    }
  | {
      fieldErrors?: Record<string, string>
      formError: string
      ok: false
    }

function makeOrderNumber() {
  const date = new Date()
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `AM-${stamp}-${randomBytes(3).toString('hex').toUpperCase()}`
}

function makeToken() {
  return randomBytes(24).toString('hex')
}

export async function createCashOnDeliveryOrder(
  cartIdentifier: string | undefined,
  locale: Locale,
  input: CheckoutInput,
  user?: AuthUser | null
): Promise<OrderResult> {
  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'orders',
    limit: 1,
    overrideAccess: true,
    where: {
      idempotencyKey: {
        equals: input.idempotencyKey
      }
    }
  })

  const existingOrder = existing.docs[0] as { confirmationToken?: string; orderNumber?: string } | undefined
  if (existingOrder?.orderNumber && existingOrder.confirmationToken) {
    return { ok: true, orderNumber: existingOrder.orderNumber, token: existingOrder.confirmationToken }
  }

  const cart = await findCartByIdentifier(cartIdentifier)
  if (!cart) {
    return { formError: 'cart_empty', ok: false }
  }

  const validatedCart = await validateCart(cartIdentifier, locale)
  if (validatedCart.items.length === 0) {
    return { formError: 'cart_empty', ok: false }
  }

  if (validatedCart.issues.some((issue) => ['out_of_stock', 'product_unavailable', 'invalid_quantity'].includes(issue.code))) {
    return { formError: 'cart_invalid', ok: false }
  }

  const deliveryConfig = await getDeliveryConfig(locale)
  if (input.deliveryMethod === 'home_delivery' && !deliveryConfig.homeDeliveryEnabled) {
    return { fieldErrors: { deliveryMethod: 'delivery_unavailable' }, formError: 'delivery_unavailable', ok: false }
  }

  if (input.deliveryMethod === 'store_pickup' && !deliveryConfig.storePickupEnabled) {
    return { fieldErrors: { deliveryMethod: 'pickup_unavailable' }, formError: 'pickup_unavailable', ok: false }
  }

  const delivery =
    input.deliveryMethod === 'home_delivery'
      ? calculateDeliveryFee(deliveryConfig, validatedCart.total, input.governorate)
      : { cost: 0 as number }

  if (delivery.issue) {
    return {
      fieldErrors: { governorate: delivery.issue },
      formError: delivery.issue,
      ok: false
    }
  }

  const totals = calculateTotals(validatedCart.items, delivery.cost)
  const orderNumber = makeOrderNumber()
  const token = makeToken()
  const now = new Date().toISOString()

  for (const item of validatedCart.items) {
    const product = await payload.findByID({
      collection: 'products',
      id: item.productId,
      overrideAccess: true
    }) as { stockQuantity?: number }
    const nextStock = Math.max(0, (product.stockQuantity ?? 0) - item.quantity)

    await payload.update({
      collection: 'products',
      data: {
        stockQuantity: nextStock,
        stockStatus: nextStock <= 0 ? 'out_of_stock' : nextStock <= 10 ? 'low_stock' : 'in_stock'
      },
      id: item.productId,
      overrideAccess: true
    })
  }

  await payload.create({
    collection: 'orders',
    data: {
      billingAddress: {
        city: input.city,
        governorate: input.governorate,
        line1: input.addressLine1,
        postalCode: input.postalCode
      },
      confirmationToken: token,
      currency: 'TND',
      customer: user?.id,
      customerEmail: input.email,
      customerFirstName: input.firstName,
      customerLastName: input.lastName,
      customerNote: input.customerNote,
      customerPhone: input.phone,
      deliveryAddress: {
        city: input.city,
        governorate: input.governorate,
        instructions: input.deliveryInstructions,
        line1: input.addressLine1,
        postalCode: input.postalCode
      },
      deliveryCost: delivery.cost,
      deliveryMethod: input.deliveryMethod,
      idempotencyKey: input.idempotencyKey,
      items: validatedCart.items.map((item) => ({
        lineSubtotal: item.lineSubtotal,
        lineTotal: item.lineTotal,
        lineVatTotal: item.lineVatTotal,
        product: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate
      })),
      locale,
      orderNumber,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'cash_on_delivery',
      status: 'received',
      statusTimestamps: {
        receivedAt: now
      },
      subtotal: totals.subtotal,
      total: totals.total,
      vatTotal: totals.vatTotal
    },
    overrideAccess: true
  })

  await markCartConverted(cart.id)

  return { ok: true, orderNumber, token }
}
