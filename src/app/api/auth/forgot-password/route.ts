import { NextResponse } from 'next/server'

import { requestPasswordReset } from '@/features/auth/service'
import { getClientIp } from '@/lib/security/getClientIp'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { rateLimitedJsonResponse } from '@/lib/security/rateLimitResponse'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const ip = await getClientIp()
  const rateLimit = checkRateLimit('forgot-password', `${ip}:${email}`)

  if (!rateLimit.allowed) {
    // Same generic shape as the normal response — a rate-limited attacker
    // must not be able to distinguish this from "email sent if it exists".
    return rateLimitedJsonResponse(rateLimit.retryAfterSeconds)
  }

  const result = await requestPasswordReset({
    email: typeof body.email === 'string' ? body.email : '',
    locale: body.locale === 'ar' ? 'ar' : 'fr'
  })

  return NextResponse.json({
    message: result.message
  })
}
