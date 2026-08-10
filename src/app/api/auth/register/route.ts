import { NextResponse } from 'next/server'

import { registerCustomer } from '@/features/auth/service'

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const result = await registerCustomer({
    acceptTerms: body.acceptTerms === true,
    email: typeof body.email === 'string' ? body.email : '',
    firstName: typeof body.firstName === 'string' ? body.firstName : '',
    lastName: typeof body.lastName === 'string' ? body.lastName : '',
    locale: body.locale === 'ar' ? 'ar' : 'fr',
    password: typeof body.password === 'string' ? body.password : '',
    passwordConfirmation: typeof body.passwordConfirmation === 'string' ? body.passwordConfirmation : '',
    phone: typeof body.phone === 'string' ? body.phone : undefined,
    returnTo: typeof body.returnTo === 'string' ? body.returnTo : undefined
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        fieldErrors: result.fieldErrors,
        message: result.formError || 'Merci de verifier les informations saisies.'
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    user: result.data
  })
}
