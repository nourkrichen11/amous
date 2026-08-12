import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { requireAdminUser } from '@/features/auth/session'

const nav = [
  { href: '/backoffice', label: 'Vue d ensemble' },
  { href: '/backoffice/orders', label: 'Commandes' },
  { href: '/backoffice/products', label: 'Produits' },
  { href: '/backoffice/inventory', label: 'Stock' },
  { href: '/backoffice/customers', label: 'Clients' },
  { href: '/backoffice/delivery', label: 'Livraison' },
  { href: '/backoffice/promotions', label: 'Promotions' },
  { href: '/backoffice/content', label: 'Contenu' },
  { href: '/backoffice/settings', label: 'Configuration' }
]

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  },
  title: {
    default: 'Administration AMOUS',
    template: '%s - Administration AMOUS'
  }
}

export default async function BackofficeLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser()

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#101827]">
      <aside className="fixed inset-y-0 hidden w-64 border-e border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-lg font-black text-[#0f172a]">AMOUS</p>
          <p className="text-xs font-semibold uppercase text-slate-500">Administration</p>
        </div>
        <nav className="grid gap-1 p-3">
          {nav.map((item) => (
            <Link className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1d4ed8]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:ps-64">
        <header className="sticky top-0 z-10 flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <Link className="text-sm font-semibold text-[#1d4ed8]" href="/admin">
            Ouvrir Payload
          </Link>
          <p className="text-sm text-slate-600">{user.firstName} {user.lastName}</p>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
