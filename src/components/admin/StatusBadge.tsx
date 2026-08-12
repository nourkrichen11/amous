import { cn } from '@/lib/utils/cn'

type StatusBadgeProps = {
  children: React.ReactNode
  className?: string
  variant?: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
}

export function StatusBadge({ children, className, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={cn('amous-status-badge', `amous-status-badge--${variant}`, className)}>
      {children}
    </span>
  )
}
