import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/features/auth/session'
import { searchAdminEntities } from '@/features/admin/topbar'

export async function GET(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      {
        code: 'ADMIN_ACCESS_DENIED',
        message: "Ce compte n'est pas autorise a acceder a l'administration."
      },
      { status: 403 }
    )
  }

  const query = new URL(request.url).searchParams.get('q') || ''
  const results = await searchAdminEntities(query)

  return NextResponse.json({ results })
}
