import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

type HomepageSectionShellProps = {
  actionHref?: string
  actionLabel?: string
  children: ReactNode
  id?: string
  subtitle?: string
  title: string
}

export function HomepageSectionShell({ actionHref, actionLabel = 'Voir tout', children, id, subtitle, title }: HomepageSectionShellProps) {
  const headingId = id ? `${id}-title` : undefined

  return (
    <section aria-labelledby={headingId} className="container-wide" id={id}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-6">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-xl font-bold leading-tight text-[var(--color-navy)] sm:text-2xl lg:text-[1.75rem]" id={headingId}>
            {title}
          </h2>
          {subtitle ? <p className="mt-1.5 text-sm text-[var(--color-text-muted)] sm:text-[15px]">{subtitle}</p> : null}
        </div>
        {actionHref ? (
          <Link
            className="group/action inline-flex min-h-[var(--touch-target)] shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--color-primary)] hover:text-[#c70511]"
            href={actionHref}
          >
            {actionLabel}
            <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover/action:translate-x-0.5 rtl:rotate-180 rtl:group-hover/action:-translate-x-0.5" size={16} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
