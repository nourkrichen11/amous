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
