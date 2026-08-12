import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

const links = [
  { href: '/admin/globals/site-settings', label: 'Boutique' },
  { href: '/admin/globals/delivery-config', label: 'Livraison' },
  { href: '/admin/collections/users', label: 'Utilisateurs' },
  { href: '/admin/collections/audit-logs', label: 'Journal d activite' }
]

export default function BackofficeSettingsPage() {
  return <div className="space-y-5"><AdminPageHeader title="Configuration" /><div className="grid gap-3 sm:grid-cols-2">{links.map((link) => <Link className="rounded-md border border-slate-200 bg-white p-4 font-semibold hover:bg-blue-50" href={link.href} key={link.href}>{link.label}</Link>)}</div></div>
}
