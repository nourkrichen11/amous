'use client'

import { Logout } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import { AdminLogo } from './AdminLoginBrand'
import { adminNavSections, isCurrentPath } from './adminNavConfig'

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="nav amous-admin-nav">
      <div className="amous-admin-nav__brand"><AdminLogo /></div>
      <nav aria-label="Navigation administration" className="amous-admin-nav__scroll">
        {adminNavSections.map((section) => (
          <section className="amous-admin-nav__section" key={section.label || 'dashboard'}>
            {section.label ? <p>{section.label}</p> : null}
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isCurrentPath(pathname, item.href)

                return (
                  <li key={item.href}>
                    <Link aria-current={active ? 'page' : undefined} className={active ? 'is-active' : undefined} href={item.href}>
                      <Icon aria-hidden="true" size={18} />
                      <span>{item.label}</span>
                      {active ? <ChevronRight aria-hidden="true" size={15} /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>
      <div className="amous-admin-nav__footer">
        <Link href="/admin/account">Mon profil</Link>
        <Logout />
      </div>
    </aside>
  )
}
