import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Money } from '@/components/admin/Money'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getPayloadClient } from '@/lib/payload/getPayload'
import { getConfirmationStatusLabel, getFulfillmentStatusLabel, getPaymentStatusLabel } from '@/features/orders/status'

export default async function BackofficeOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const payload = await getPayloadClient()
  const search = q?.trim()
  const result = await payload.find({
    collection: 'orders',
    depth: 0,
    limit: 50,
    overrideAccess: true,
    sort: '-createdAt',
    where: search
      ? {
          or: [
            { orderNumber: { like: search } },
            { customerEmail: { like: search } },
            { customerPhoneNormalized: { like: search.replaceAll(/\D/g, '') } },
            { customerFirstName: { like: search } },
            { customerLastName: { like: search } }
          ]
        }
      : undefined
  })

  return (
    <div className="space-y-5">
      <AdminPageHeader action={<Link className="rounded-md bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white" href="/admin/collections/orders/create">Creer</Link>} title="Commandes" />
      <form className="flex gap-2">
        <input className="h-10 w-full max-w-md rounded-md border border-slate-300 px-3 text-sm" defaultValue={q} name="q" placeholder="Commande, client, telephone, email..." />
        <button className="rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold" type="submit">Rechercher</button>
      </form>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Commande</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Telephone</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Paiement</th><th className="px-4 py-3">Confirmation</th><th className="px-4 py-3">Livraison</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.docs.map((order) => (
              <tr className="hover:bg-slate-50" key={String(order.id)}>
                <td className="px-4 py-3 font-semibold">{String(order.orderNumber ?? '')}</td>
                <td className="px-4 py-3">{String(order.customerFirstName ?? '')} {String(order.customerLastName ?? '')}</td>
                <td className="px-4 py-3" dir="ltr">{String(order.customerPhone ?? '')}</td>
                <td className="px-4 py-3 font-semibold"><Money amount={typeof order.total === 'number' ? order.total : 0} /></td>
                <td className="px-4 py-3"><StatusBadge variant="warning">{getPaymentStatusLabel(String(order.paymentStatus ?? ''))}</StatusBadge></td>
                <td className="px-4 py-3"><StatusBadge variant="info">{getConfirmationStatusLabel(String(order.confirmationStatus ?? ''))}</StatusBadge></td>
                <td className="px-4 py-3"><StatusBadge>{getFulfillmentStatusLabel(String(order.fulfillmentStatus ?? ''))}</StatusBadge></td>
                <td className="px-4 py-3"><Link className="font-semibold text-[#1d4ed8]" href={`/admin/collections/orders/${String(order.id)}`}>Ouvrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
