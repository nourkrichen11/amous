import { notFound } from 'next/navigation'

import { AccountLayout } from '@/components/auth/AccountLayout'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { getCustomerOrderByNumber } from '@/features/auth/data'
import { requireCustomerUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'
import { formatTND } from '@/lib/formatting/currency'

type AccountOrderDetailPageProps = {
  params: Promise<{ locale: string; orderId: string }>
}

export default async function AccountOrderDetailPage({ params }: AccountOrderDetailPageProps) {
  const { locale: rawLocale, orderId } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/commandes/${orderId}`)
  const order = await getCustomerOrderByNumber(user, orderId)

  if (!order) {
    notFound()
  }

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte/commandes`} locale={locale} user={user}>
      <Breadcrumbs items={[{ href: `/${locale}/mon-compte/commandes`, label: 'Commandes' }, { label: order.orderNumber }]} locale={locale} />
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Statut: {order.status} - Paiement: {order.paymentStatus}
        </p>

        <div className="mt-5 grid gap-3">
          {order.items.map((item) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] px-4 py-3" key={item.id}>
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {item.quantity} x {item.productSku}
                </p>
              </div>
              <p className="font-semibold">{formatTND(item.total / 1000, locale)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between border-t border-[var(--color-border)] pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatTND(order.total / 1000, locale)}</span>
        </div>
      </div>
    </AccountLayout>
  )
}
