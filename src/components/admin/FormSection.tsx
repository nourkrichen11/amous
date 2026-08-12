type FormSectionProps = {
  children: React.ReactNode
  description?: string
  title: string
}

export function FormSection({ children, description, title }: FormSectionProps) {
  return (
    <section className="amous-form-section">
      <header className="amous-form-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="amous-form-section__body">{children}</div>
    </section>
  )
}
