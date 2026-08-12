import { cn } from '@/lib/utils/cn'

type AdminListToolbarProps = {
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
  filters?: React.ReactNode
}

export function AdminListToolbar({ actions, children, className, filters }: AdminListToolbarProps) {
  return (
    <section className={cn('amous-list-toolbar', className)}>
      <div className="amous-list-toolbar__row">
        <div className="amous-list-toolbar__main">{children}</div>
        {actions ? <div className="amous-list-toolbar__actions">{actions}</div> : null}
      </div>
      {filters ? <div className="amous-list-toolbar__filters">{filters}</div> : null}
    </section>
  )
}
