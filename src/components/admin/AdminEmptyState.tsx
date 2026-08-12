import { cn } from '@/lib/utils/cn'

type AdminEmptyStateProps = {
  action?: React.ReactNode
  className?: string
  compact?: boolean
  description?: string
  icon?: React.ReactNode
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  title: string
}

export function AdminEmptyState({
  action,
  className,
  compact = false,
  description,
  icon,
  primaryAction,
  secondaryAction,
  title
}: AdminEmptyStateProps) {
  const actions = primaryAction || secondaryAction || action

  return (
    <div className={cn('amous-state amous-state--empty', compact && 'amous-state--compact', className)}>
      {icon ? <div className="amous-state__icon">{icon}</div> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actions ? (
        <div className="amous-state__action">
          {primaryAction || action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
