import { z } from 'zod'

import { isValidTunisianPhone, normalizePhone } from '@/lib/phone'

export const quantitySchema = z.coerce.number().int().min(1)

export const checkoutSchema = z.object({
  addressLine1: z.string().min(4, 'addressLine1'),
  city: z.string().min(2, 'city'),
  customerNote: z.string().max(500).optional(),
  deliveryInstructions: z.string().max(500).optional(),
  deliveryMethod: z.enum(['home_delivery', 'store_pickup']),
  email: z.string().email('email'),
  firstName: z.string().min(2, 'firstName'),
  governorate: z.string().min(2, 'governorate'),
  idempotencyKey: z.string().min(12, 'idempotencyKey'),
  lastName: z.string().min(2, 'lastName'),
  paymentMethod: z.enum(['cash_on_delivery']),
  phone: z.string().refine((value) => isValidTunisianPhone(value), 'phone').transform((value) => normalizePhone(value) || value),
  postalCode: z.string().min(4, 'postalCode'),
  terms: z.literal('on')
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
