import { NextResponse } from 'next/server'

import { getCurrentUserSummary } from '@/features/auth/session'

export async function GET() {
  const user = await getCurrentUserSummary()

  if (!user) {
    return NextResponse.json(
      {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Vous devez vous connecter pour acceder a cette page.'
      },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
