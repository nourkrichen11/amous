'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { CategoryItem } from '@/features/catalogue/types'

type MobileMenuProps = {
  categories: CategoryItem[]
  locale: Locale
}

export function MobileMenu({ categories, locale }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        aria-expanded={open}
        aria-label={t(locale, 'navigation.menu')}
        className="inline-flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)]"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40" role="presentation">
          <aside
            aria-label={t(locale, 'navigation.menu')}
            className="ms-auto flex h-full w-[min(88vw,24rem)] flex-col bg-[var(--color-surface)] p-4 shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <Link className="text-xl font-bold" href={`/${locale}`} onClick={() => setOpen(false)}>
                Amous
              </Link>
              <button
                aria-label="Close menu"
                className="inline-flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)]"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <nav className="mt-6 grid gap-2">
              <Link className="rounded-md px-3 py-3 hover:bg-slate-100" href={`/${locale}`} onClick={() => setOpen(false)}>
                {t(locale, 'navigation.home')}
              </Link>
              <Link className="rounded-md px-3 py-3 hover:bg-slate-100" href={`/${locale}/boutique`} onClick={() => setOpen(false)}>
                {t(locale, 'navigation.shop')}
              </Link>
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <p className="px-3 text-sm font-semibold text-[var(--color-text-muted)]">{t(locale, 'navigation.categories')}</p>
                <div className="mt-2 grid gap-1">
                  {categories.map((category) => (
                    <Link
                      className="rounded-md px-3 py-3 hover:bg-slate-100"
                      href={`/${locale}/c/${category.slug}`}
                      key={String(category.id)}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
