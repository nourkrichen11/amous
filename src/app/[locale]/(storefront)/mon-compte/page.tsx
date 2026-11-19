import Link from 'next/link'

import { AccountLayout } from '@/components/auth/AccountLayout'
import { requireCustomerUser } from '@/features/auth/session'
import { getCustomerOrders } from '@/features/auth/data'
import { getCustomerOrderStatus } from '@/features/orders/status'
import { isLocale, t } from '@/i18n/config'
import { formatTND } from '@/lib/formatting/currency'

type AccountDashboardPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountDashboardPage({ params }: AccountDashboardPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte`)
  const orders = await getCustomerOrders(user)

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte`} locale={locale} user={user}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
          <p className="text-sm text-[var(--color-text-muted)]">Adresse e-mail</p>
          <p className="mt-2 font-semibold">{user.email}</p>
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
          <p className="text-sm text-[var(--color-text-muted)]">Commandes</p>
          <p className="mt-2 text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
          <p className="text-sm text-[var(--color-text-muted)]">Adresses enregistrees</p>
          <p className="mt-2 text-2xl font-bold">{user.addresses.length}</p>
        </div>
      </div>

      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Dernieres commandes</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Retrouvez ici vos commandes les plus recentes.</p>
          </div>
          <Link className="text-sm font-semibold text-[var(--color-primary)] hover:underline" href={`/${locale}/mon-compte/commandes`}>
            Voir tout
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {orders.slice(0, 5).map((order) => (
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
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">Aucune commande n&apos;est associee a votre compte pour le moment.</p>
        )}
      </div>
    </AccountLayout>
  )
}
