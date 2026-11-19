import { NextResponse } from 'next/server'

export const RATE_LIMIT_MESSAGE = 'Trop de tentatives. Merci de reessayer dans quelques minutes.'

export function rateLimitedJsonResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { code: 'RATE_LIMITED', message: RATE_LIMIT_MESSAGE },
    { headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) }, status: 429 }
  )
}
