import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getPayloadClient } from '@/lib/payload/getPayload'

export default async function BackofficePromotionsPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'promotions', depth: 0, limit: 50, overrideAccess: true, sort: '-updatedAt' })
  return <div className="space-y-5"><AdminPageHeader action={<Link className="rounded-md bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white" href="/admin/collections/promotions/create">Creer une promotion</Link>} title="Promotions" /><div className="rounded-md border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nom</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Valeur</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{result.docs.map((promotion) => <tr key={String(promotion.id)}><td className="px-4 py-3 font-semibold">{String(promotion.name ?? '')}</td><td className="px-4 py-3">{String(promotion.type ?? '')}</td><td className="px-4 py-3">{String(promotion.value ?? '')}</td><td className="px-4 py-3">{promotion.active === false ? 'Non' : 'Oui'}</td><td className="px-4 py-3"><Link className="font-semibold text-[#1d4ed8]" href={`/admin/collections/promotions/${String(promotion.id)}`}>Modifier</Link></td></tr>)}</tbody></table></div><Link className="font-semibold text-[#1d4ed8]" href="/admin/collections/coupon-codes">Codes promo</Link></div>
}
