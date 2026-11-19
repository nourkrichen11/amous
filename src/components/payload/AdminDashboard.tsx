import Link from 'next/link'
import { ArrowRight, Box, ClipboardList, PackageCheck, Send, TriangleAlert } from 'lucide-react'

import { getAdminDashboardData } from '@/features/admin/dashboard'
import { getConfirmationStatusLabel, getFulfillmentStatusLabel, getPaymentStatusLabel } from '@/features/orders/status'
import { formatMoney } from '@/lib/money'

type DashboardMetricProps = {
  href: string
  label: string
  tone?: 'default' | 'danger' | 'warning'
  value: React.ReactNode
}

function DashboardMetric({ href, label, tone = 'default', value }: DashboardMetricProps) {
  return (
    <Link className={`amous-dashboard__metric amous-dashboard__metric--${tone}`} href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Link>
  )
}

function orderStatusVariant(status: string) {
  if (status === 'cancelled' || status === 'delivery_failed') {
    return 'danger'
  }

  if (status === 'pending' || status === 'unfulfilled') {
    return 'warning'
  }

  if (status === 'paid' || status === 'confirmed' || status === 'delivered') {
    return 'success'
  }

  return 'info'
}

function formatDashboardDate(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export async function AdminDashboard() {
  const data = await getAdminDashboardData()
  const actions = [
    { count: data.toConfirm, href: '/admin/collections/orders?where[confirmationStatus][equals]=pending', icon: ClipboardList, label: 'commandes a confirmer', tone: 'warning' },
    { count: data.toPrepare, href: '/admin/collections/orders?where[fulfillmentStatus][equals]=unfulfilled', icon: PackageCheck, label: 'commandes a preparer', tone: 'info' },
    { count: data.toShip, href: '/admin/collections/orders?where[fulfillmentStatus][equals]=ready_to_ship', icon: Send, label: 'commandes a expedier', tone: 'info' },
    { count: data.lowStock, href: '/admin/collections/products?where[stockStatus][equals]=low_stock', icon: TriangleAlert, label: 'produits en stock faible', tone: 'danger' }
  ]

  return (
    <main className="amous-dashboard">
      <section aria-label="Indicateurs du jour" className="amous-dashboard__metrics">
        <DashboardMetric href="/admin/collections/orders" label="Commandes aujourd'hui" value={data.ordersToday} />
        <DashboardMetric href="/admin/collections/orders" label="Chiffre d'affaires aujourd'hui" value={formatMoney(data.revenueToday)} />
        <DashboardMetric href="/admin/collections/orders?where[confirmationStatus][equals]=pending" label="A confirmer" tone="warning" value={data.toConfirm} />
        <DashboardMetric href="/admin/collections/orders?where[fulfillmentStatus][equals]=unfulfilled" label="A preparer" tone="warning" value={data.toPrepare} />
        <DashboardMetric href="/admin/collections/orders?where[fulfillmentStatus][equals]=ready_to_ship" label="A expedier" value={data.toShip} />
        <DashboardMetric href="/admin/collections/products?where[stockStatus][equals]=low_stock" label="Stock faible" tone="danger" value={data.lowStock} />
      </section>

      <section className="amous-dashboard__grid">
        <div className="amous-dashboard__panel">
          <div className="amous-dashboard__panel-header">
            <div>
              <h2>Commandes recentes</h2>
              <p>Les dernieres commandes enregistrees.</p>
            </div>
            <Link href="/admin/collections/orders">Voir les commandes <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>

          {data.recentOrders.length ? (
            <div className="amous-dashboard__table-wrap">
              <table className="amous-dashboard__table">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Client</th>
                    <th className="amous-dashboard__number">Total</th>
                    <th>Paiement</th>
                    <th>Confirmation</th>
                    <th>Livraison</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const orderId = String(order.id)
                    const customer = `${String(order.customerFirstName ?? '')} ${String(order.customerLastName ?? '')}`.trim() || 'Client'
                    const createdAt = formatDashboardDate(order.createdAt)

                    return (
                      <tr key={orderId}>
                        <td>
                          <Link href={`/admin/collections/orders/${orderId}`}>
                            <strong>{String(order.orderNumber ?? '')}</strong>
                            {createdAt ? <span>{createdAt}</span> : null}
                          </Link>
                        </td>
                        <td>
                          <strong>{customer}</strong>
                          <span dir="ltr">{String(order.customerPhone ?? '')}</span>
                        </td>
                        <td className="amous-dashboard__number"><strong>{formatMoney(typeof order.total === 'number' ? order.total : 0)}</strong></td>
                        <td><span className={`amous-status amous-status--${orderStatusVariant(String(order.paymentStatus ?? ''))}`}>{getPaymentStatusLabel(String(order.paymentStatus ?? ''))}</span></td>
                        <td><span className={`amous-status amous-status--${orderStatusVariant(String(order.confirmationStatus ?? ''))}`}>{getConfirmationStatusLabel(String(order.confirmationStatus ?? ''))}</span></td>
                        <td><span className={`amous-status amous-status--${orderStatusVariant(String(order.fulfillmentStatus ?? ''))}`}>{getFulfillmentStatusLabel(String(order.fulfillmentStatus ?? ''))}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="amous-dashboard__empty">
              <Box aria-hidden="true" size={20} />
              <p>Aucune commande recente.</p>
            </div>
          )}
        </div>

        <aside className="amous-dashboard__panel amous-dashboard__actions">
          <div className="amous-dashboard__panel-header">
            <div>
              <h2>A traiter</h2>
              <p>Les prochaines actions operationnelles.</p>
            </div>
          </div>
          <div className="amous-dashboard__action-list">
            {actions.map((action) => {
              const Icon = action.icon

              return (
                <Link className={`amous-dashboard__action amous-dashboard__action--${action.tone}`} href={action.href} key={action.label}>
                  <Icon aria-hidden="true" size={18} />
                  <span><strong>{action.count}</strong> {action.label}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              )
            })}
          </div>
        </aside>
      </section>
    </main>
  )
}
