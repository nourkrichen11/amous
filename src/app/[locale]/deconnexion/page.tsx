import { redirect } from 'next/navigation'

import { logoutCurrentUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'

type LogoutPageProps = {
  params: Promise<{ locale: string }>
}

export default async function LogoutPage({ params }: LogoutPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  await logoutCurrentUser()
  redirect(`/${locale}?status=logged-out`)
}
