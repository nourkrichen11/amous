import { NextResponse } from 'next/server'

import { logoutCurrentUser } from '@/features/auth/session'

export async function POST() {
  await logoutCurrentUser()

  return NextResponse.json({
    message: 'Vous avez ete deconnecte avec succes.'
  })
}
