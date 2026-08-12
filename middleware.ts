import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale } from '@/i18n/config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|placeholders).*)']
}
