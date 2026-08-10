type AnnouncementBarProps = {
  text?: string
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) {
    return null
  }

  return (
    <div className="bg-[var(--color-secondary)] py-2 text-center text-sm font-medium text-white">
      <p className="container-page">{text}</p>
    </div>
  )
}
