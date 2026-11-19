import Link from 'next/link'

import { AccountLayout } from '@/components/auth/AccountLayout'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCustomerOrders } from '@/features/auth/data'
import { requireCustomerUser } from '@/features/auth/session'
import { getCustomerOrderStatus } from '@/features/orders/status'
import { isLocale, t } from '@/i18n/config'
import { formatTND } from '@/lib/formatting/currency'

type AccountOrdersPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountOrdersPage({ params }: AccountOrdersPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/commandes`)
  const orders = await getCustomerOrders(user)

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte/commandes`} locale={locale} user={user}>
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <h2 className="text-xl font-semibold">Vos commandes</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Consultez l&apos;historique de vos commandes et leur statut.</p>

        {orders.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {orders.map((order) => (
              <Link
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] px-4 py-3 hover:border-[var(--color-primary)]"
                href={`/${locale}/mon-compte/commandes/${order.orderNumber}`}
                key={String(order.id)}
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t(locale, `order.statusValue.${getCustomerOrderStatus(order as never)}`)}
                  </p>
                </div>
                <p className="font-semibold">{formatTND(order.total / 1000, locale)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState actionHref={`/${locale}/boutique`} actionLabel="Decouvrir la boutique" title="Aucune commande" description="Vos prochaines commandes apparaitront ici." />
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
