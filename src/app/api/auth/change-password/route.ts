import { NextResponse } from 'next/server'

import { changePassword } from '@/features/auth/service'
import { getCurrentUser } from '@/features/auth/session'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { rateLimitedJsonResponse } from '@/lib/security/rateLimitResponse'

export async function POST(request: Request) {
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

  const rateLimit = checkRateLimit('change-password', String(user.id))

  if (!rateLimit.allowed) {
    return rateLimitedJsonResponse(rateLimit.retryAfterSeconds)
  }

  const body = (await request.json()) as Record<string, unknown>
  const result = await changePassword({
    confirmNewPassword: typeof body.confirmNewPassword === 'string' ? body.confirmNewPassword : '',
    currentPassword: typeof body.currentPassword === 'string' ? body.currentPassword : '',
    email: user.email,
    newPassword: typeof body.newPassword === 'string' ? body.newPassword : '',
    userId: user.id
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

  return NextResponse.json({
    success: true
  })
}
