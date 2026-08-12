import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { ProductItem } from '@/features/catalogue/types'

type StockBadgeProps = {
  locale: Locale
  status: ProductItem['stockStatus']
}

export function StockBadge({ locale, status }: StockBadgeProps) {
  const config = {
    in_stock: {
      className: 'bg-[var(--color-success)]',
      textClassName: 'text-[var(--color-success)]',
      label: t(locale, 'product.inStock')
    },
    low_stock: {
      className: 'bg-[var(--color-warning)]',
      textClassName: 'text-[var(--color-warning)]',
      label: t(locale, 'product.lowStock')
    },
    out_of_stock: {
      className: 'bg-slate-400',
      textClassName: 'text-slate-500',
      label: t(locale, 'product.outOfStock')
    }
  }[status]

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${config.textClassName}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${config.className}`} />
      {config.label}
    </span>
  )
}
