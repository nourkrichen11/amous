import type { HeaderData } from '@/features/homepage/types'
import type { Locale } from '@/i18n/config'

import { HeaderShell } from './HeaderShell'

type HeaderProps = {
  data: HeaderData
  locale: Locale
}

export function Header({ data, locale }: HeaderProps) {
  return <HeaderShell data={data} locale={locale} />
}
