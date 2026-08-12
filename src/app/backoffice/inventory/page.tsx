import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getAvailableStock } from '@/features/inventory/status'
import { getPayloadClient } from '@/lib/payload/getPayload'

export default async function BackofficeInventoryPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'products', depth: 0, limit: 100, overrideAccess: true, sort: 'stockQuantity' })

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Stock" />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Produit</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Physique</th><th className="px-4 py-3">Reserve</th><th className="px-4 py-3">Disponible</th><th className="px-4 py-3">Seuil</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Mouvements</th></tr></thead><tbody className="divide-y divide-slate-100">{result.docs.map((product) => <tr className="hover:bg-slate-50" key={String(product.id)}><td className="px-4 py-3 font-semibold">{String(product.name ?? '')}</td><td className="px-4 py-3">{String(product.sku ?? '')}</td><td className="px-4 py-3">{Number(product.stockQuantity ?? 0)}</td><td className="px-4 py-3">{Number(product.reservedStock ?? 0)}</td><td className="px-4 py-3">{getAvailableStock({ reservedStock: Number(product.reservedStock ?? 0), stockQuantity: Number(product.stockQuantity ?? 0) })}</td><td className="px-4 py-3">{Number(product.lowStockThreshold ?? 10)}</td><td className="px-4 py-3"><StatusBadge>{String(product.stockStatus ?? '')}</StatusBadge></td><td className="px-4 py-3"><Link className="font-semibold text-[#1d4ed8]" href="/admin/collections/stock-movements">Voir</Link></td></tr>)}</tbody></table>
      </div>
    </div>
  )
}
