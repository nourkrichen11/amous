import Link from 'next/link'

import { cn } from '@/lib/utils/cn'

export type AdminQuickFilter = {
  active: boolean
  count?: number
  href: string
  label: string
}

/** Pill-style quick-filter row (e.g. "Toutes / À confirmer / À préparer / ..."), shared across Orders/Returns list views instead of one-off markup per page. */
export function AdminQuickFilterTabs({ filters }: { filters: AdminQuickFilter[] }) {
  return (
    <div aria-label="Filtres rapides" className="amous-quick-filters" role="tablist">
      {filters.map((filter) => (
        <Link
          aria-selected={filter.active}
          className={cn('amous-quick-filter', filter.active && 'is-active')}
          href={filter.href}
          key={filter.href}
          role="tab"
        >
          {filter.label}
          {typeof filter.count === 'number' ? <span className="amous-quick-filter__count">{filter.count}</span> : null}
        </Link>
      ))}
    </div>
  )
}
