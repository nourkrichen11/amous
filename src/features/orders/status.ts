export const orderStatusOptions = [
  { label: 'Nouvelle', value: 'new' },
  { label: 'En traitement', value: 'processing' },
  { label: 'Terminee', value: 'completed' },
  { label: 'Annulee', value: 'cancelled' },
  { label: 'Retournee', value: 'returned' }
] as const

export const confirmationStatusOptions = [
  { label: 'A confirmer', value: 'pending' },
  { label: 'Confirmee', value: 'confirmed' },
  { label: 'Client injoignable', value: 'unreachable' },
  { label: 'Annulee', value: 'cancelled' }
] as const

export const paymentStatusOptions = [
  { label: 'Non paye', value: 'unpaid' },
  { label: 'En attente', value: 'pending' },
  { label: 'Paye', value: 'paid' },
  { label: 'Partiellement rembourse', value: 'partially_refunded' },
  { label: 'Rembourse', value: 'refunded' }
] as const

export const paymentMethodOptions = [
  { label: 'Paiement a la livraison', value: 'cash_on_delivery' },
  { label: 'Virement bancaire', value: 'bank_transfer' },
  { label: 'Paiement en ligne', value: 'online' }
] as const

export const fulfillmentStatusOptions = [
  { label: 'A preparer', value: 'unfulfilled' },
  { label: 'En preparation', value: 'preparing' },
  { label: 'Prete a expedier', value: 'ready_to_ship' },
  { label: 'Expediee', value: 'shipped' },
  { label: 'Livree', value: 'delivered' },
  { label: 'Echec de livraison', value: 'delivery_failed' },
  { label: 'Retournee', value: 'returned' }
] as const

export type OrderStatus = (typeof orderStatusOptions)[number]['value']
export type ConfirmationStatus = (typeof confirmationStatusOptions)[number]['value']
export type PaymentStatus = (typeof paymentStatusOptions)[number]['value']
export type PaymentMethod = (typeof paymentMethodOptions)[number]['value']
export type FulfillmentStatus = (typeof fulfillmentStatusOptions)[number]['value']

function labelFor(options: readonly { label: string; value: string }[], value?: string) {
  return options.find((option) => option.value === value)?.label ?? value ?? ''
}

export function getOrderStatusLabel(status?: string) {
  return labelFor(orderStatusOptions, status)
}

export function getConfirmationStatusLabel(status?: string) {
  return labelFor(confirmationStatusOptions, status)
}

export function getPaymentStatusLabel(status?: string) {
  return labelFor(paymentStatusOptions, status)
}

export function getPaymentMethodLabel(method?: string) {
  return labelFor(paymentMethodOptions, method)
}

export function getFulfillmentStatusLabel(status?: string) {
  return labelFor(fulfillmentStatusOptions, status)
}

export const legacyOrderStatusOptions = [
  'received',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'shipped',
  'delivered',
  'cancelled'
] as const

export type LegacyOrderStatus = (typeof legacyOrderStatusOptions)[number]

/**
 * `status` is a legacy field with no business authority any more (see
 * OrderWorkflowService) but is kept as a real, queryable Postgres column, so
 * it's derived here and written alongside the 4 authoritative fields on every
 * transition rather than left to drift or computed only on read.
 *
 * Three of these mappings are lexical best-fits for legacy values that have
 * no true equivalent in the newer enums (`returned`, `delivery_failed`,
 * `ready_to_ship`) — flagged since `status` is confirmed unread by any
 * business logic today, so getting them exactly right is low-risk but is a
 * judgment call, not a fact derivable from the code.
 */
export function deriveLegacyStatus(order: {
  confirmationStatus?: ConfirmationStatus
  fulfillmentStatus?: FulfillmentStatus
  orderStatus?: OrderStatus
}): LegacyOrderStatus {
  if (order.orderStatus === 'cancelled' || order.confirmationStatus === 'cancelled') {
    return 'cancelled'
  }

  if (order.orderStatus === 'returned' || order.fulfillmentStatus === 'returned' || order.fulfillmentStatus === 'delivered') {
    return 'delivered'
  }

  if (order.fulfillmentStatus === 'shipped' || order.fulfillmentStatus === 'delivery_failed') {
    return 'shipped'
  }

  if (order.fulfillmentStatus === 'ready_to_ship') {
    return 'ready_for_pickup'
  }

  if (order.fulfillmentStatus === 'preparing') {
    return 'preparing'
  }

  if (order.confirmationStatus === 'confirmed') {
    return 'confirmed'
  }

  return 'received'
}

export const customerOrderStatusOptions = [...legacyOrderStatusOptions, 'returned'] as const

export type CustomerOrderStatus = (typeof customerOrderStatusOptions)[number]

/**
 * Presentation mapper shared by every customer-facing surface (order
 * confirmation page, account order list/detail) so they always agree with
 * each other and with the admin panel, instead of some reading the frozen
 * legacy `status` field and others reading the live fields. Deliberately
 * excludes `paymentStatus` — that already has its own separate display on
 * every surface, so folding it in here would lose information.
 */
export function getCustomerOrderStatus(order: {
  confirmationStatus?: ConfirmationStatus
  fulfillmentStatus?: FulfillmentStatus
  orderStatus?: OrderStatus
}): CustomerOrderStatus {
  if (order.orderStatus === 'cancelled' || order.confirmationStatus === 'cancelled') {
    return 'cancelled'
  }

  if (order.orderStatus === 'returned' || order.fulfillmentStatus === 'returned') {
    return 'returned'
  }

  if (order.fulfillmentStatus === 'delivered') {
    return 'delivered'
  }

  if (order.fulfillmentStatus === 'shipped') {
    return 'shipped'
  }

  if (order.fulfillmentStatus === 'preparing' || order.fulfillmentStatus === 'ready_to_ship') {
    return 'preparing'
  }

  if (order.confirmationStatus === 'confirmed') {
    return 'confirmed'
  }

  return 'received'
}
