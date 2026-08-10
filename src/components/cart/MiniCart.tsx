'use client'

import { ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { removeCartItemAction } from '@/features/cart/actions'
import type { CartView } from '@/features/cart/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import { formatTND } from '@/lib/formatting/currency'

type MiniCartProps = {
  cart: CartView
  locale: Locale
}

export function MiniCart({ cart, locale }: MiniCartProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={t(locale, 'navigation.cart')}
        className="relative inline-flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)]"
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart aria-hidden="true" size={19} />
        {cart.count > 0 ? (
          <span className="absolute -end-2 -top-2 min-w-5 rounded-full bg-[var(--color-primary)] px-1 text-xs font-bold text-white">
            {cart.count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40" role="presentation">
          <aside
            aria-label={t(locale, 'cart.miniCart')}
            className="ms-auto flex h-full w-[min(92vw,26rem)] flex-col bg-[var(--color-surface)] p-4 shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{t(locale, 'cart.miniCart')}</h2>
              <button
                aria-label={t(locale, 'common.close')}
                className="inline-flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)]"
                ref={closeRef}
                type="button"
                onClick={() => {
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <div aria-live="polite" className="sr-only">
              {t(locale, 'cart.itemsCount', { count: cart.count })}
            </div>
            {cart.items.length > 0 ? (
              <>
                <div className="mt-4 flex-1 overflow-y-auto">
                  {cart.items.slice(0, 6).map((item) => (
                    <div className="border-b border-[var(--color-border)] py-3" key={item.id}>
                      <div className="flex gap-3">
                        <div className="h-16 w-16 flex-none rounded bg-slate-100" />
                        <div className="min-w-0 flex-1">
                          <Link className="font-semibold hover:text-[var(--color-primary)]" href={`/${locale}/p/${item.productSlug}`}>
                            {item.productName}
                          </Link>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {t(locale, 'product.sku')} <span dir="ltr">{item.productSku}</span>
                          </p>
                          <p className="mt-1 text-sm">
                            {item.quantity} × {formatTND(item.unitPrice / 1000, locale)}
                          </p>
                        </div>
                        <form action={removeCartItemAction}>
                          <input name="locale" type="hidden" value={locale} />
                          <input name="itemId" type="hidden" value={item.id} />
                          <button className="text-sm font-semibold text-[var(--color-error)]" type="submit">
                            {t(locale, 'cart.remove')}
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="flex justify-between font-bold">
                    <span>{t(locale, 'cart.subtotal')}</span>
                    <span>{formatTND(cart.total / 1000, locale)}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)] px-4 font-semibold" href={`/${locale}/panier`}>
                      {t(locale, 'cart.viewCart')}
                    </Link>
                    <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" href={`/${locale}/commande`}>
                      {t(locale, 'checkout.title')}
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-center text-[var(--color-text-muted)]">
                <p>{t(locale, 'cart.empty')}</p>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </>
  )
}
