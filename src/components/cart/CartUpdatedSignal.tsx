'use client'

import { useEffect } from 'react'

import { CART_UPDATED_EVENT } from '@/features/cart/events'

/** Tells the header to re-read the cart count after an add-to-cart redirect. */
export function CartUpdatedSignal() {
  useEffect(() => {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  }, [])

  return null
}
