import { NextResponse } from 'next/server'

import { getCurrentUserSummary } from '@/features/auth/session'
import { getCartCookie } from '@/features/cart/cookies'
import { getCartCountByIdentifier } from '@/features/cart/service'

export async function GET() {
  const [currentUser, cartIdentifier] = await Promise.all([getCurrentUserSummary(), getCartCookie()])
  const cartCount = await getCartCountByIdentifier(cartIdentifier)

  return NextResponse.json({
    cartCount,
    currentUser,
    wishlistCount: 0
  })
}
