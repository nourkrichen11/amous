import { CheckCircle2, CircleAlert } from 'lucide-react'
import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { t, type TranslationKey } from '@/i18n/config'

type CartStatusNoticeProps = {
  locale: Locale
  params: Record<string, string | undefined>
}

const ISSUE_CODES = ['invalid_quantity', 'minimum_quantity_changed', 'out_of_stock', 'price_changed', 'product_unavailable', 'quantity_reduced']

/** Feedback for the `cart` / `cartError` flags set by the add-to-cart action redirect. */
export function CartStatusNotice({ locale, params }: CartStatusNoticeProps) {
  const added = params.cart === 'added'
  const issue = params.cartError && ISSUE_CODES.includes(params.cartError) ? params.cartError : undefined

  if (!added && !issue) {
    return null
  }

  return (
    <div
      className={[
        'mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-md)] border px-4 py-3 text-sm',
        issue ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      ].join(' ')}
      role="status"
    >
      {issue ? <CircleAlert aria-hidden="true" className="shrink-0" size={18} /> : <CheckCircle2 aria-hidden="true" className="shrink-0" size={18} />}
      <p className="min-w-0 flex-1 font-medium">{issue ? t(locale, `cart.issue.${issue}` as TranslationKey) : 'Produit ajouté au panier.'}</p>
      <Link className="font-semibold underline underline-offset-2" href={`/${locale}/panier`}>
        {t(locale, 'cart.viewCart')}
      </Link>
    </div>
  )
}
