import Link from 'next/link'

type EmptyStateProps = {
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}

export function EmptyState({ actionHref, actionLabel, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-[var(--color-text-muted)]">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex min-h-[var(--touch-target)] items-center rounded-md bg-[var(--color-primary)] px-4 text-white"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
