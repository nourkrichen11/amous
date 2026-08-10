import type { AuthUserSummary } from '@/features/auth/types'
import type { CartView } from '@/features/cart/types'
import type { HeaderData } from '@/features/homepage/types'
import type { Locale } from '@/i18n/config'

import { HeaderShell } from './HeaderShell'

type HeaderProps = {
  cart: CartView
  currentUser?: AuthUserSummary | null
  data: HeaderData
  locale: Locale
}

export function Header({ cart, currentUser, data, locale }: HeaderProps) {
  return <HeaderShell cartCount={cart.count} currentUser={currentUser} data={data} locale={locale} />
}
