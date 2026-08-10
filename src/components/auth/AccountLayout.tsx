import Link from 'next/link'
import type { ReactNode } from 'react'

import type { AuthUser } from '@/features/auth/types'
import type { Locale } from '@/i18n/config'

const items = [
  { href: '/mon-compte', label: 'Tableau de bord' },
  { href: '/mon-compte/commandes', label: 'Commandes' },
  { href: '/mon-compte/profil', label: 'Profil' },
  { href: '/mon-compte/adresses', label: 'Adresses' },
  { href: '/mon-compte/securite', label: 'Securite' }
] as const

export function AccountLayout({
  children,
  currentPath,
  locale,
  user
}: {
  children: ReactNode
  currentPath: string
  locale: Locale
  user: AuthUser
}) {
  return (
    <main className="container-page py-8" id="main-content">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mon compte</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Bonjour {user.firstName} {user.lastName}, gerez vos informations et vos commandes depuis cet espace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="h-fit rounded-md border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-subtle)]">
          <nav aria-label="Navigation du compte">
            <ul className="grid gap-1">
              {items.map((item) => {
                const href = `/${locale}${item.href}`
                const active = currentPath === href

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium',
                        active ? 'bg-[color:color-mix(in_srgb,var(--color-primary)_10%,white_90%)] text-[var(--color-primary)]' : 'hover:bg-slate-50'
                      ].join(' ')}
                      href={href}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
              <li className="pt-2">
                <Link className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium hover:bg-slate-50" href={`/${locale}/deconnexion`}>
                  Se deconnecter
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <section className="space-y-6">{children}</section>
      </div>
    </main>
  )
}
