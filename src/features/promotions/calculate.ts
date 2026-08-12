export type PromotionInput = {
  active?: boolean
  endsAt?: Date | string
  minimumOrderTotal?: number
  startsAt?: Date | string
  type: 'fixed_amount' | 'free_shipping' | 'percentage'
  value: number
}

function isWithinDateRange(promotion: PromotionInput, now: Date) {
  const startsAt = promotion.startsAt ? new Date(promotion.startsAt) : undefined
  const endsAt = promotion.endsAt ? new Date(promotion.endsAt) : undefined

  if (startsAt && startsAt > now) {
    return false
  }

  if (endsAt && endsAt < now) {
    return false
  }

  return true
}

export function isPromotionActive(promotion: PromotionInput, orderTotal: number, now = new Date()) {
  if (promotion.active === false) {
    return false
  }

  if (!isWithinDateRange(promotion, now)) {
    return false
  }

  return !(typeof promotion.minimumOrderTotal === 'number' && orderTotal < promotion.minimumOrderTotal)
}

export function calculatePromotionDiscount(promotion: PromotionInput, orderTotal: number, shippingCost = 0, now = new Date()) {
  if (!isPromotionActive(promotion, orderTotal, now)) {
    return 0
  }

  if (promotion.type === 'free_shipping') {
    return shippingCost
  }

  if (promotion.type === 'fixed_amount') {
    return Math.min(orderTotal, Math.round(promotion.value))
  }

  return Math.min(orderTotal, Math.round((orderTotal * promotion.value) / 100))
}
