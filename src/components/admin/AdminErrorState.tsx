type AdminErrorStateProps = {
  action?: React.ReactNode
  message: string
}

export function AdminErrorState({ action, message }: AdminErrorStateProps) {
  return (
    <div className="amous-state amous-state--error" role="alert">
      <p>{message}</p>
      {action ? <div className="amous-state__action">{action}</div> : null}
    </div>
  )
}
