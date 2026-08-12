import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/features/auth/session'
import { updateOwnProfile } from '@/features/auth/service'

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

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
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

  const body = (await request.json()) as Record<string, unknown>
  const result = await updateOwnProfile(user, {
    email: typeof body.email === 'string' ? body.email : user.email,
    firstName: typeof body.firstName === 'string' ? body.firstName : user.firstName,
    lastName: typeof body.lastName === 'string' ? body.lastName : user.lastName,
    phone: typeof body.phone === 'string' ? body.phone : user.phone
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        fieldErrors: result.fieldErrors,
        message: 'Merci de verifier les informations saisies.'
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
