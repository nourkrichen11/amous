import Link from 'next/link'
import type { ReactNode } from 'react'

type HomepageSectionShellProps = {
  actionHref?: string
  actionLabel?: string
  children: ReactNode
  subtitle?: string
  title: string
}

export function HomepageSectionShell({ actionHref, actionLabel = 'Voir tout', children, subtitle, title }: HomepageSectionShellProps) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-normal text-[var(--color-text)] sm:text-[1.75rem]">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-[var(--color-text-muted)] sm:text-base">{subtitle}</p> : null}
        </div>
        {actionHref ? (
          <Link className="min-h-[44px] shrink-0 px-1 py-2 text-sm font-semibold text-[var(--color-primary)] hover:underline" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
