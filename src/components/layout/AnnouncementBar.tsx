type AnnouncementBarProps = {
  text?: string
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) {
    return null
  }

  return (
    <div className="flex min-h-[34px] items-center bg-[var(--color-secondary)] py-1 text-center text-sm font-medium text-white">
      <p className="container-page">{text}</p>
    </div>
  )
}
