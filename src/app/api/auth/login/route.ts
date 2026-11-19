import { NextResponse } from 'next/server'

import { loginCustomer } from '@/features/auth/service'
import { getClientIp } from '@/lib/security/getClientIp'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { rateLimitedJsonResponse } from '@/lib/security/rateLimitResponse'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const ip = await getClientIp()
  const rateLimit = checkRateLimit('login', `${ip}:${email}`)

  if (!rateLimit.allowed) {
    return rateLimitedJsonResponse(rateLimit.retryAfterSeconds)
  }

  const result = await loginCustomer({
    email: typeof body.email === 'string' ? body.email : '',
    locale: body.locale === 'ar' ? 'ar' : 'fr',
    password: typeof body.password === 'string' ? body.password : '',
    rememberMe: body.rememberMe === true,
    returnTo: typeof body.returnTo === 'string' ? body.returnTo : undefined
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        code: 'INVALID_CREDENTIALS',
        message: result.formError || 'Adresse e-mail ou mot de passe incorrect.'
      },
      { status: 401 }
    )
  }

  return NextResponse.json({
    redirectTo: result.redirectTo,
    user: result.data
  })
}
