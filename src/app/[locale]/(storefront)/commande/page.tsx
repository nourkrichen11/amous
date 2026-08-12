import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import Link from 'next/link'

import { createOrderAction } from '@/features/cart/actions'
import { getAuthenticatedCheckoutPrefill } from '@/features/auth/actions'
import { getCartCookie } from '@/features/cart/cookies'
import { getDeliveryConfig, calculateDeliveryFee } from '@/features/cart/delivery'
import { validateCart } from '@/features/cart/service'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatTND } from '@/lib/formatting/currency'
import { isLocale, t } from '@/i18n/config'

type CheckoutPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  return {
    robots: { follow: false, index: false },
    title: t(locale, 'checkout.title')
  }
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const errorValue = typeof query.error === 'string' ? query.error : undefined
  const [cart, deliveryConfig, authPrefill] = await Promise.all([
    validateCart(await getCartCookie(), locale),
    getDeliveryConfig(locale),
    getAuthenticatedCheckoutPrefill(locale)
  ])
  const estimatedDelivery = deliveryConfig.estimatedDeliveryText
  const exampleDelivery = calculateDeliveryFee(deliveryConfig, cart.total, deliveryConfig.supportedGovernorates[0] ?? '')

  return (
    <main className="container-page py-8" id="main-content">
      <Breadcrumbs items={[{ href: `/${locale}/panier`, label: t(locale, 'cart.title') }, { label: t(locale, 'checkout.title') }]} locale={locale} />
      <h1 className="mt-6 text-3xl font-bold">{t(locale, 'checkout.title')}</h1>
      {cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState actionHref={`/${locale}/boutique`} actionLabel={t(locale, 'navigation.shop')} title={t(locale, 'cart.empty')} />
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-md border border-[var(--color-border)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Votre commande</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Vous pouvez continuer en tant qu&apos;invite ou vous connecter pour retrouver plus facilement vos commandes.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="inline-flex min-h-[44px] items-center rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold" href={`/${locale}/connexion?returnTo=${encodeURIComponent(`/${locale}/commande`)}`}>
                  Se connecter
                </Link>
                <Link className="inline-flex min-h-[44px] items-center rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold" href={`/${locale}/inscription?returnTo=${encodeURIComponent(`/${locale}/commande`)}`}>
                  Creer un compte
                </Link>
              </div>
            </div>
          </section>

          <form action={createOrderAction} className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <input name="locale" type="hidden" value={locale} />
            <input name="idempotencyKey" type="hidden" value={randomUUID()} />
            <div className="grid gap-6">
            {errorValue ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
                {t(locale, `checkout.error.${errorValue}`)}
              </div>
            ) : null}
            <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-xl font-bold">{t(locale, 'checkout.customerInfo')}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.firstName')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.firstName || ''} name="firstName" required />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.lastName')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.lastName || ''} name="lastName" required />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.email')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.email || ''} name="email" required type="email" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.phone')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.phone || ''} dir="ltr" name="phone" required type="tel" />
                </label>
              </div>
            </section>
            <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-xl font-bold">{t(locale, 'delivery.title')}</h2>
              <div className="mt-4 grid gap-3">
                <label className="flex items-center gap-2 rounded-md border border-[var(--color-border)] p-3">
                  <input defaultChecked name="deliveryMethod" type="radio" value="home_delivery" />
                  {t(locale, 'delivery.homeDelivery')} ({formatTND(exampleDelivery.cost / 1000, locale)})
                </label>
                {deliveryConfig.storePickupEnabled ? (
                  <label className="flex items-center gap-2 rounded-md border border-[var(--color-border)] p-3">
                    <input name="deliveryMethod" type="radio" value="store_pickup" />
                    {t(locale, 'delivery.storePickup')}
                  </label>
                ) : null}
                {estimatedDelivery ? <p className="text-sm text-[var(--color-text-muted)]">{estimatedDelivery}</p> : null}
              </div>
            </section>
            <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-xl font-bold">{t(locale, 'checkout.address')}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
                  {t(locale, 'checkout.addressLine1')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.addressLine1 || ''} name="addressLine1" required />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.city')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.city || ''} name="city" required />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.governorate')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.governorate || ''} list="governorates" name="governorate" required />
                  <datalist id="governorates">
                    {deliveryConfig.supportedGovernorates.map((zone) => (
                      <option key={zone} value={zone} />
                    ))}
                  </datalist>
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t(locale, 'checkout.postalCode')}
                  <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={authPrefill?.postalCode || ''} dir="ltr" name="postalCode" required />
                </label>
                <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
                  {t(locale, 'checkout.deliveryInstructions')}
                  <textarea className="min-h-24 rounded-md border border-[var(--color-border)] px-3 py-2" name="deliveryInstructions" />
                </label>
              </div>
            </section>
            <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-xl font-bold">{t(locale, 'payment.title')}</h2>
              <label className="mt-4 flex items-center gap-2 rounded-md border border-[var(--color-border)] p-3">
                <input defaultChecked name="paymentMethod" type="radio" value="cash_on_delivery" />
                {t(locale, 'payment.cashOnDelivery')}
              </label>
            </section>
            <section className="rounded-md border border-[var(--color-border)] bg-white p-5">
              <label className="flex items-start gap-2 text-sm">
                <input className="mt-1" name="terms" required type="checkbox" />
                <span>{t(locale, 'checkout.terms')}</span>
              </label>
              <label className="mt-4 grid gap-1 text-sm font-semibold">
                {t(locale, 'checkout.customerNote')}
                <textarea className="min-h-20 rounded-md border border-[var(--color-border)] px-3 py-2" name="customerNote" />
              </label>
            </section>
          </div>
          <aside className="h-fit rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
            <h2 className="text-xl font-bold">{t(locale, 'checkout.review')}</h2>
            <div className="mt-4 grid gap-3">
              {cart.items.map((item) => (
                <div className="flex justify-between gap-4 text-sm" key={item.id}>
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span>{formatTND(item.lineTotal / 1000, locale)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-5 grid gap-3 border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between">
                <dt>{t(locale, 'cart.subtotal')}</dt>
                <dd>{formatTND(cart.subtotal / 1000, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t(locale, 'cart.vat')}</dt>
                <dd>{formatTND(cart.vatTotal / 1000, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t(locale, 'delivery.title')}</dt>
                <dd>{t(locale, 'checkout.calculatedAfterAddress')}</dd>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <dt>{t(locale, 'cart.totalBeforeDelivery')}</dt>
                <dd>{formatTND(cart.total / 1000, locale)}</dd>
              </div>
            </dl>
            <button className="mt-5 min-h-[var(--touch-target)] w-full rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" type="submit">
              {t(locale, 'checkout.placeOrder')}
            </button>
            <Link className="mt-3 inline-flex min-h-[var(--touch-target)] w-full items-center justify-center rounded-md border border-[var(--color-border)] px-4 font-semibold" href={`/${locale}/panier`}>
              {t(locale, 'cart.title')}
            </Link>
          </aside>
          </form>
        </>
      )}
    </main>
  )
}
