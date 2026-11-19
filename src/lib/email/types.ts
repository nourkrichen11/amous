export type EmailMessage = {
  html: string
  subject: string
  text?: string
  to: string
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<void>
}
