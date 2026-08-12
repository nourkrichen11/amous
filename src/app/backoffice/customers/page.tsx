import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getPayloadClient } from '@/lib/payload/getPayload'

export default async function BackofficeCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const payload = await getPayloadClient()
  const search = q?.trim()
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 50,
    overrideAccess: true,
    sort: '-createdAt',
    where: { and: [{ role: { equals: 'customer' } }, ...(search ? [{ or: [{ email: { like: search } }, { firstName: { like: search } }, { lastName: { like: search } }, { normalizedPhone: { like: search.replaceAll(/\D/g, '') } }] }] : [])] }
  })
  return <div className="space-y-5"><AdminPageHeader title="Clients" /><form className="flex gap-2"><input className="h-10 w-full max-w-md rounded-md border border-slate-300 px-3 text-sm" defaultValue={q} name="q" placeholder="Nom, telephone, email..." /><button className="rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold" type="submit">Rechercher</button></form><div className="overflow-x-auto rounded-md border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Telephone</th><th className="px-4 py-3">Actif</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{result.docs.map((user) => <tr className="hover:bg-slate-50" key={String(user.id)}><td className="px-4 py-3 font-semibold">{String(user.firstName ?? '')} {String(user.lastName ?? '')}</td><td className="px-4 py-3">{String(user.email ?? '')}</td><td className="px-4 py-3" dir="ltr">{String(user.phone ?? '')}</td><td className="px-4 py-3">{user.active === false ? 'Non' : 'Oui'}</td><td className="px-4 py-3"><Link className="font-semibold text-[#1d4ed8]" href={`/admin/collections/users/${String(user.id)}`}>Ouvrir</Link></td></tr>)}</tbody></table></div></div>
}
