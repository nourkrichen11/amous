import { NextResponse } from 'next/server'

import { resetPassword } from '@/features/auth/service'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
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
