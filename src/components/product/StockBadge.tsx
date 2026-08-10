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
      className: 'border-green-200 bg-green-50 text-[var(--color-success)]',
      label: t(locale, 'product.inStock')
    },
    low_stock: {
      className: 'border-amber-200 bg-amber-50 text-[var(--color-warning)]',
      label: t(locale, 'product.lowStock')
    },
    out_of_stock: {
      className: 'border-red-200 bg-red-50 text-[var(--color-error)]',
      label: t(locale, 'product.outOfStock')
    }
  }[status]

  return <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>
}
