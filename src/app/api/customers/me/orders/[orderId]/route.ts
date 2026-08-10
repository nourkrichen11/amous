import { NextResponse } from 'next/server'

import { getCustomerOrderByNumber } from '@/features/auth/data'
import { getCurrentUser } from '@/features/auth/session'

type OrderRouteProps = {
  params: Promise<{ orderId: string }>
}

export async function GET(_: Request, { params }: OrderRouteProps) {
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

  const { orderId } = await params
  const order = await getCustomerOrderByNumber(user, orderId)

  if (!order) {
    return NextResponse.json(
      {
        code: 'ACCESS_DENIED',
        message: "Vous n'etes pas autorise a acceder a cette ressource."
      },
      { status: 403 }
    )
  }

  return NextResponse.json({ order })
}
