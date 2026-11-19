import { randomBytes } from 'node:crypto'

import type { Locale } from '@/i18n/config'
import type { AuthUser } from '@/features/auth/types'
import { calculateDeliveryFee, getDeliveryConfig } from '@/features/cart/delivery'
import type { CheckoutInput } from '@/features/cart/validation'
import { lockHashedKey, LOCK_NS } from '@/features/db/advisoryLock'
import { reserveInventory } from '@/features/inventory/service'
import { createOrderEvent } from '@/features/orders/events'
import { makeCommercialOrderNumber } from '@/features/orders/orderNumbers'
import { deriveLegacyStatus } from '@/features/orders/status'
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
  const token = makeToken()
  const now = new Date().toISOString()

  const transactionID = await payload.db.beginTransaction()

  if (transactionID == null) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  try {
    // Closes the true-concurrent double-submit race the pre-transaction
    // check above can't: two simultaneous requests with the same
    // idempotencyKey can both pass that check before either commits. Under
    // this lock, only one re-check can run at a time.
    await lockHashedKey(payload, transactionID, LOCK_NS.IDEMPOTENCY_KEY, input.idempotencyKey)

    const existingInTx = await payload.find({
      collection: 'orders',
      limit: 1,
      overrideAccess: true,
      req: { transactionID } as never,
      where: {
        idempotencyKey: {
          equals: input.idempotencyKey
        }
      }
    })

    const existingOrderInTx = existingInTx.docs[0] as { confirmationToken?: string; orderNumber?: string } | undefined
    if (existingOrderInTx?.orderNumber && existingOrderInTx.confirmationToken) {
      await payload.db.commitTransaction(transactionID)
      return { ok: true, orderNumber: existingOrderInTx.orderNumber, token: existingOrderInTx.confirmationToken }
    }

    // Generated inside the transaction (previously before it began) so a
    // rollback — e.g. insufficient stock discovered below — correctly
    // un-reserves the number too, and the counters-table row lock (see
    // orderNumbers.ts) actually protects concurrent checkouts.
    const orderNumber = await makeCommercialOrderNumber(payload, transactionID)

    const order = await payload.create({
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
        fulfillmentStatus: 'unfulfilled',
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
        amountToCollect: totals.total,
        confirmationStatus: 'pending',
        orderStatus: 'new',
        orderNumber,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        status: deriveLegacyStatus({ confirmationStatus: 'pending', fulfillmentStatus: 'unfulfilled', orderStatus: 'new' }),
        statusTimestamps: {
          receivedAt: now
        },
        subtotal: totals.subtotal,
        total: totals.total,
        vatTotal: totals.vatTotal
      },
      overrideAccess: true,
      req: { transactionID } as never
    })

    await reserveInventory(
      payload,
      validatedCart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      {
        orderId: order.id,
        reason: `Reservation commande ${orderNumber}`,
        transactionID
      }
    )

    await createOrderEvent(payload, {
      eventType: 'order_created',
      newState: {
        confirmationStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        orderStatus: 'new',
        paymentStatus: 'unpaid'
      },
      orderId: order.id,
      transactionID
    })

    await markCartConverted(cart.id, transactionID)

    await payload.db.commitTransaction(transactionID)

    return { ok: true, orderNumber, token }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)

    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return { formError: 'cart_invalid', ok: false }
    }

    const pgCode = (error as { cause?: { code?: string }; code?: string } | undefined)?.code ?? (error as { cause?: { code?: string } } | undefined)?.cause?.code

    if (pgCode === '23505') {
      return { formError: 'IDEMPOTENCY_CONFLICT', ok: false }
    }

    throw error
  }
}
