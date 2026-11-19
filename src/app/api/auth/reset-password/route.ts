import { NextResponse } from 'next/server'

import { resetPassword } from '@/features/auth/service'
import { getClientIp } from '@/lib/security/getClientIp'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { rateLimitedJsonResponse } from '@/lib/security/rateLimitResponse'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const ip = await getClientIp()
  const rateLimit = checkRateLimit('reset-password', ip)

  if (!rateLimit.allowed) {
    return rateLimitedJsonResponse(rateLimit.retryAfterSeconds)
  }

  const result = await resetPassword(
    {
      password: typeof body.password === 'string' ? body.password : '',
      passwordConfirmation: typeof body.passwordConfirmation === 'string' ? body.passwordConfirmation : '',
      token: typeof body.token === 'string' ? body.token : ''
    },
    body.locale === 'ar' ? 'ar' : 'fr'
  )

  if (!result.ok) {
    return NextResponse.json(
      {
        code: 'INVALID_RESET_TOKEN',
        fieldErrors: result.fieldErrors,
        message: result.formError || 'Le lien de reinitialisation est invalide ou expire.'
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true
  })
}
