import { describe, expect, it } from 'vitest'

import { checkoutSchema } from './validation'
import { validateQuantity } from './service'

const product = {
  active: true,
  id: 'p1',
  minimumOrderQuantity: 2,
  name: 'Product',
  publicPrice: 10000,
  quantityIncrement: 2,
  sku: 'SKU',
  stockQuantity: 7,
  stockStatus: 'in_stock' as const
}

describe('cart and checkout validation', () => {
  it('rejects invalid quantity', () => {
    expect(validateQuantity(product, 0).issue?.code).toBe('invalid_quantity')
  })

  it('adjusts quantity to minimum and increment rules', () => {
    const result = validateQuantity(product, 3)
    expect(result.quantity).toBe(4)
    expect(result.issue?.code).toBe('minimum_quantity_changed')
  })

  it('reduces quantity when stock is insufficient', () => {
    const result = validateQuantity(product, 10)
    expect(result.quantity).toBe(7)
    expect(result.issue?.code).toBe('quantity_reduced')
  })

  it('accepts valid cash-on-delivery checkout data', () => {
    expect(
      checkoutSchema.safeParse({
        addressLine1: 'Rue 1',
        city: 'Tunis',
        deliveryMethod: 'home_delivery',
        email: 'client@example.com',
        firstName: 'Ali',
        governorate: 'Tunis',
        idempotencyKey: 'idempotency-12345',
        lastName: 'Ben',
        paymentMethod: 'cash_on_delivery',
        phone: '21650123456',
        postalCode: '1000',
        terms: 'on'
      }).success
    ).toBe(true)
  })
})
