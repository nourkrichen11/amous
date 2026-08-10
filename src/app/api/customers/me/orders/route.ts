import { NextResponse } from 'next/server'

import { getCustomerOrders } from '@/features/auth/data'
import { getCurrentUser } from '@/features/auth/session'

export async function GET() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'customer') {
    return NextResponse.json(
      {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Vous devez vous connecter pour acceder a cette page.'
      },
      { status: 401 }
    )
  }

  const orders = await getCustomerOrders(user)
  return NextResponse.json({ orders })
}
