import { NextResponse } from 'next/server'

import { requestPasswordReset } from '@/features/auth/service'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const result = await requestPasswordReset({
    email: typeof body.email === 'string' ? body.email : ''
  })

  return NextResponse.json({
    message: result.message
  })
}
