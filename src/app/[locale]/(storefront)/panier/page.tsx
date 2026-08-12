import type { Metadata } from 'next'
import Link from 'next/link'

import { clearCartAction, removeCartItemAction, updateCartItemAction } from '@/features/cart/actions'
import { getCartCookie } from '@/features/cart/cookies'
import { validateCart } from '@/features/cart/service'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatTND } from '@/lib/formatting/currency'
import { isLocale, t } from '@/i18n/config'

type CartPageProps = {
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  return {
    robots: { follow: false, index: false },
    title: t(locale, 'cart.title')
  }
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const cart = await validateCart(await getCartCookie(), locale)

  return (
    <main className="container-page py-8" id="main-content">
      <Breadcrumbs items={[{ label: t(locale, 'cart.title') }]} locale={locale} />
      <h1 className="mt-6 text-3xl font-bold">{t(locale, 'cart.title')}</h1>
      <div aria-live="polite" className="sr-only">
        {t(locale, 'cart.itemsCount', { count: cart.count })}
      </div>
      {cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState actionHref={`/${locale}/boutique`} actionLabel={t(locale, 'navigation.shop')} description={t(locale, 'cart.emptyDescription')} title={t(locale, 'cart.empty')} />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="grid gap-4">
            {cart.issues.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <h2 className="font-semibold">{t(locale, 'cart.issues')}</h2>
                <ul className="mt-2 list-inside list-disc">
                  {cart.issues.map((issue, index) => (
                    <li key={`${issue.code}-${index}`}>{t(locale, `cart.issue.${issue.code}`)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {cart.items.map((item) => (
              <article className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4" key={item.id}>
                <div className="grid gap-4 sm:grid-cols-[5rem_1fr_auto]">
                  <div className="h-20 rounded bg-slate-100" />
                  <div>
                    <Link className="font-semibold hover:text-[var(--color-primary)]" href={`/${locale}/p/${item.productSlug}`}>
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {t(locale, 'product.sku')} <span dir="ltr">{item.productSku}</span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {t(locale, 'product.unit')}: {item.unit}
                    </p>
                    <p className="mt-2 text-sm">{formatTND(item.unitPrice / 1000, locale)}</p>
                  </div>
                  <div className="grid gap-3 sm:min-w-48">
                    <form action={updateCartItemAction} className="flex items-end gap-2">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="itemId" type="hidden" value={item.id} />
                      <label className="grid flex-1 gap-1 text-sm font-semibold">
                        {t(locale, 'product.quantity')}
                        <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={item.quantity} min="1" name="quantity" type="number" />
                      </label>
                      <button className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3 font-semibold" type="submit">
                        {t(locale, 'cart.update')}
                      </button>
                    </form>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold">{formatTND(item.lineTotal / 1000, locale)}</span>
                      <form action={removeCartItemAction}>
                        <input name="locale" type="hidden" value={locale} />
                        <input name="itemId" type="hidden" value={item.id} />
                        <button className="font-semibold text-[var(--color-error)]" type="submit">
                          {t(locale, 'cart.remove')}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="h-fit rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-subtle)]">
            <h2 className="text-xl font-bold">{t(locale, 'cart.summary')}</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt>{t(locale, 'cart.subtotal')}</dt>
                <dd>{formatTND(cart.subtotal / 1000, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t(locale, 'cart.vat')}</dt>
                <dd>{formatTND(cart.vatTotal / 1000, locale)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-bold">
                <dt>{t(locale, 'cart.totalBeforeDelivery')}</dt>
                <dd>{formatTND(cart.total / 1000, locale)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t(locale, 'cart.deliveryAtCheckout')}</p>
            <div className="mt-5 grid gap-2">
              <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" href={`/${locale}/commande`}>
                {t(locale, 'cart.checkout')}
              </Link>
              <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)] px-4 font-semibold" href={`/${locale}/boutique`}>
                {t(locale, 'cart.continueShopping')}
              </Link>
              <form action={clearCartAction}>
                <input name="locale" type="hidden" value={locale} />
                <button className="min-h-[var(--touch-target)] w-full rounded-md px-4 font-semibold text-[var(--color-error)]" type="submit">
                  {t(locale, 'cart.clear')}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
