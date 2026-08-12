import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { findOrder } from '@/features/cart/service'
import { getDeliveryConfig } from '@/features/cart/delivery'
import { getSiteSettings } from '@/features/catalogue/data'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { formatTND } from '@/lib/formatting/currency'
import { getPublicSiteUrl } from '@/lib/env'
import { isLocale, t } from '@/i18n/config'

type ConfirmationPageProps = {
  params: Promise<{ locale: string; orderNumber: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type OrderDoc = {
  customerEmail?: string
  customerFirstName?: string
  customerLastName?: string
  customerPhone?: string
  deliveryAddress?: {
    city?: string
    governorate?: string
    instructions?: string
    line1?: string
    postalCode?: string
  }
  deliveryCost?: number
  deliveryMethod?: 'home_delivery' | 'store_pickup'
  items?: Array<{
    id?: string
    lineTotal?: number
    productName?: string
    productSku?: string
    quantity?: number
    unit?: string
    unitPrice?: number
  }>
  orderNumber?: string
  paymentMethod?: 'cash_on_delivery'
  status?: string
  subtotal?: number
  total?: number
  vatTotal?: number
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'

  return {
    robots: { follow: false, index: false },
    title: t(locale, 'order.confirmationTitle')
  }
}

export default async function ConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { locale: rawLocale, orderNumber } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const token = typeof query.token === 'string' ? query.token : ''

  if (!token) {
    notFound()
  }

  const order = (await findOrder(orderNumber, token)) as OrderDoc | null

  if (!order) {
    notFound()
  }

  const [settings, deliveryConfig] = await Promise.all([getSiteSettings(locale), getDeliveryConfig(locale)])
  const whatsappText = encodeURIComponent(`${t(locale, 'order.supportMessage')} ${order.orderNumber}\n${getPublicSiteUrl()}/${locale}/commande/confirmation/${order.orderNumber}?token=${token}`)
  const whatsappHref = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${whatsappText}` : undefined

  return (
    <main className="container-page py-8" id="main-content">
      <Breadcrumbs items={[{ href: `/${locale}/boutique`, label: t(locale, 'navigation.shop') }, { label: t(locale, 'order.confirmationTitle') }]} locale={locale} />
      <section className="mt-8 rounded-md border border-green-200 bg-green-50 p-6">
        <p className="text-sm font-semibold text-[var(--color-success)]">{t(locale, 'order.success')}</p>
        <h1 className="mt-2 text-3xl font-bold">{t(locale, 'order.confirmationTitle')}</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {t(locale, 'order.number')}: <span className="font-semibold" dir="ltr">{order.orderNumber}</span>
        </p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid gap-6">
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-xl font-bold">{t(locale, 'order.items')}</h2>
            <div className="mt-4 grid gap-3">
              {order.items?.map((item) => (
                <div className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-3" key={item.id ?? item.productSku}>
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {t(locale, 'product.sku')} <span dir="ltr">{item.productSku}</span>
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {item.quantity} {item.unit} × {formatTND((item.unitPrice ?? 0) / 1000, locale)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatTND((item.lineTotal ?? 0) / 1000, locale)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-xl font-bold">{t(locale, 'checkout.customerInfo')}</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="font-semibold">{t(locale, 'checkout.firstName')}</dt>
                <dd>{order.customerFirstName} {order.customerLastName}</dd>
              </div>
              <div>
                <dt className="font-semibold">{t(locale, 'checkout.email')}</dt>
                <dd>{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="font-semibold">{t(locale, 'checkout.phone')}</dt>
                <dd dir="ltr">{order.customerPhone}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-md border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-xl font-bold">{t(locale, 'delivery.title')}</h2>
            <p className="mt-2 font-semibold">{order.deliveryMethod === 'store_pickup' ? t(locale, 'delivery.storePickup') : t(locale, 'delivery.homeDelivery')}</p>
            {order.deliveryAddress ? (
              <address className="mt-2 text-sm not-italic text-[var(--color-text-muted)]">
                {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.governorate} {order.deliveryAddress.postalCode}
              </address>
            ) : null}
            {deliveryConfig.estimatedDeliveryText ? <p className="mt-3 text-sm text-[var(--color-text-muted)]">{deliveryConfig.estimatedDeliveryText}</p> : null}
          </div>
        </section>
        <aside className="h-fit rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
          <h2 className="text-xl font-bold">{t(locale, 'cart.summary')}</h2>
          <dl className="mt-4 grid gap-3">
            <div className="flex justify-between">
              <dt>{t(locale, 'order.status')}</dt>
              <dd>{t(locale, `order.statusValue.${order.status}`)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t(locale, 'payment.title')}</dt>
              <dd>{t(locale, 'payment.cashOnDelivery')}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t(locale, 'cart.subtotal')}</dt>
              <dd>{formatTND((order.subtotal ?? 0) / 1000, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t(locale, 'cart.vat')}</dt>
              <dd>{formatTND((order.vatTotal ?? 0) / 1000, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t(locale, 'delivery.title')}</dt>
              <dd>{formatTND((order.deliveryCost ?? 0) / 1000, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-bold">
              <dt>{t(locale, 'cart.total')}</dt>
              <dd>{formatTND((order.total ?? 0) / 1000, locale)}</dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-2">
            {whatsappHref ? (
              <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" href={whatsappHref}>
                {t(locale, 'order.contactSupport')}
              </Link>
            ) : null}
            <Link className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)] px-4 font-semibold" href={`/${locale}/boutique`}>
              {t(locale, 'cart.continueShopping')}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
