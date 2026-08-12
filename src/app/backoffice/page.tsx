import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { Money } from '@/components/admin/Money'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getAdminDashboardData } from '@/features/admin/dashboard'
import { getConfirmationStatusLabel, getFulfillmentStatusLabel, getPaymentStatusLabel } from '@/features/orders/status'

export default async function BackofficeDashboardPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Vue d ensemble" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="Indicateurs">
        <MetricCard label="Commandes aujourd'hui" value={data.ordersToday} />
        <MetricCard label="CA aujourd'hui" value={<Money amount={data.revenueToday} />} />
        <MetricCard label="A confirmer" value={data.toConfirm} />
        <MetricCard label="A preparer" value={data.toPrepare} />
        <MetricCard label="A expedier" value={data.toShip} />
        <MetricCard label="Stock faible" value={data.lowStock} />
      </section>
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold">Commandes recentes</h2>
          <Link className="text-sm font-semibold text-[#1d4ed8]" href="/backoffice/orders">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Confirmation</th>
                <th className="px-4 py-3">Livraison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentOrders.map((order) => (
                <tr className="hover:bg-slate-50" key={String(order.id)}>
                  <td className="px-4 py-3 font-semibold">{String(order.orderNumber ?? '')}</td>
                  <td className="px-4 py-3">{String(order.customerFirstName ?? '')} {String(order.customerLastName ?? '')}</td>
                  <td className="px-4 py-3" dir="ltr">{String(order.customerPhone ?? '')}</td>
                  <td className="px-4 py-3 font-semibold"><Money amount={typeof order.total === 'number' ? order.total : 0} /></td>
                  <td className="px-4 py-3"><StatusBadge variant="warning">{getPaymentStatusLabel(String(order.paymentStatus ?? ''))}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge variant="info">{getConfirmationStatusLabel(String(order.confirmationStatus ?? ''))}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge>{getFulfillmentStatusLabel(String(order.fulfillmentStatus ?? ''))}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
