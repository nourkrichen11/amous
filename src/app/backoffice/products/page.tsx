import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Money } from '@/components/admin/Money'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getPayloadClient } from '@/lib/payload/getPayload'

export default async function BackofficeProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const payload = await getPayloadClient()
  const search = q?.trim()
  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 50,
    overrideAccess: true,
    sort: '-updatedAt',
    where: search ? { or: [{ name: { like: search } }, { sku: { like: search } }, { manufacturerReference: { like: search } }] } : undefined
  })

  return (
    <div className="space-y-5">
      <AdminPageHeader action={<Link className="rounded-md bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white" href="/admin/collections/products/create">Ajouter un produit</Link>} title="Produits" />
      <form className="flex gap-2"><input className="h-10 w-full max-w-md rounded-md border border-slate-300 px-3 text-sm" defaultValue={q} name="q" placeholder="Nom, SKU, reference fabricant..." /><button className="rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold" type="submit">Rechercher</button></form>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Produit</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Ref. fabricant</th><th className="px-4 py-3">Prix</th><th className="px-4 py-3">Promo</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{result.docs.map((product) => <tr className="hover:bg-slate-50" key={String(product.id)}><td className="px-4 py-3 font-semibold">{String(product.name ?? '')}</td><td className="px-4 py-3">{String(product.sku ?? '')}</td><td className="px-4 py-3">{String(product.manufacturerReference ?? '')}</td><td className="px-4 py-3"><Money amount={typeof product.publicPrice === 'number' ? product.publicPrice : 0} /></td><td className="px-4 py-3">{typeof product.previousPrice === 'number' ? <Money amount={product.previousPrice} /> : '-'}</td><td className="px-4 py-3">{Number(product.stockQuantity ?? 0)} / {Number(product.reservedStock ?? 0)} reserves</td><td className="px-4 py-3"><StatusBadge variant={product.stockStatus === 'out_of_stock' ? 'danger' : product.stockStatus === 'low_stock' ? 'warning' : 'success'}>{String(product.stockStatus ?? '')}</StatusBadge></td><td className="px-4 py-3"><Link className="font-semibold text-[#1d4ed8]" href={`/admin/collections/products/${String(product.id)}`}>Modifier</Link></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
