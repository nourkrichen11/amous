import type { Locale } from '@/i18n/config'

export type CartIssueCode =
  | 'price_changed'
  | 'out_of_stock'
  | 'quantity_reduced'
  | 'product_unavailable'
  | 'minimum_quantity_changed'
  | 'invalid_quantity'

export type CartIssue = {
  code: CartIssueCode
  itemId?: string
  message: string
}

export type CartLine = {
  id?: string
  productId: string | number
  productSlug?: string
  productSku: string
  productName: string
  productImageUrl?: string
  unit: string
  quantity: number
  unitPrice: number
  vatRate: number
  lineSubtotal: number
  lineVatTotal: number
  lineTotal: number
  stockStatus?: string
  stockQuantity?: number
}

export type CartView = {
  cartId?: string
  count: number
  currency: 'TND'
  issues: CartIssue[]
  items: CartLine[]
  locale: Locale
  subtotal: number
  total: number
  vatTotal: number
}

export type DeliveryMethod = 'home_delivery' | 'store_pickup'
export type PaymentMethod = 'cash_on_delivery'

export type DeliveryConfigView = {
  defaultDeliveryFee: number
  estimatedDeliveryText?: string
  freeDeliveryThreshold?: number
  homeDeliveryEnabled: boolean
  storePickupEnabled: boolean
  supportedGovernorates: string[]
}
