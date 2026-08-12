import { cn } from '@/lib/utils/cn'

type AdminPageHeaderProps = {
  action?: React.ReactNode
  className?: string
  description?: string
  eyebrow?: string
  meta?: string
  title: string
}

export function AdminPageHeader({ action, className, description, eyebrow, meta, title }: AdminPageHeaderProps) {
  return (
    <header className={cn('amous-page-header', className)}>
      <div className="amous-page-header__content">
        {eyebrow ? <p className="amous-page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="amous-page-header__title">{title}</h1>
        {description ? <p className="amous-page-header__description">{description}</p> : null}
        {meta ? <p className="amous-page-header__meta">{meta}</p> : null}
      </div>
      {action ? <div className="amous-page-header__actions">{action}</div> : null}
    </header>
  )
}
