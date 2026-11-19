import { cn } from '@/lib/utils/cn'

type AdminPageHeaderProps = {
  action?: React.ReactNode
  className?: string
  description?: string
  eyebrow?: string
  meta?: string
  title?: string
}

/**
 * The one page header used across every custom admin/list view — title +
 * description on the start side, primary action on the end side, aligned
 * with the content column below it (never floated to one corner). Pass
 * only `action` (no `title`) for the actions-only variant some pages use
 * when the title already comes from elsewhere.
 */
export function AdminPageHeader({ action, className, description, eyebrow, meta, title }: AdminPageHeaderProps) {
  if (!title && !action) {
    return null
  }

  return (
    <header className={cn('amous-page-header', !title && 'amous-page-header--actions-only', className)}>
      {title ? (
        <div className="amous-page-header__content">
          {eyebrow ? <p className="amous-page-header__eyebrow">{eyebrow}</p> : null}
          <h1 className="amous-page-header__title">{title}</h1>
          {description ? <p className="amous-page-header__description">{description}</p> : null}
          {meta ? <p className="amous-page-header__meta">{meta}</p> : null}
        </div>
      ) : null}
      {action ? <div className="amous-page-header__actions">{action}</div> : null}
    </header>
  )
}
