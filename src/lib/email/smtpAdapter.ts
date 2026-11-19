import nodemailer from 'nodemailer'

import type { EmailAdapter, EmailMessage } from './types'

export type SmtpConfig = {
  from: string
  host: string
  password: string
  port: number
  secure: boolean
  user: string
}

/**
 * Provider-agnostic on purpose: any SMTP-speaking provider works (OVH's own
 * SMTP relay, SES, Postmark, Brevo, self-hosted) without touching auth
 * business logic — only the env vars change.
 */
export function createSmtpEmailAdapter(config: SmtpConfig): EmailAdapter {
  const transport = nodemailer.createTransport({
    auth: {
      pass: config.password,
      user: config.user
    },
    host: config.host,
    port: config.port,
    secure: config.secure
  })

  return {
    async send(message: EmailMessage) {
      await transport.sendMail({
        from: config.from,
        html: message.html,
        subject: message.subject,
        text: message.text,
        to: message.to
      })
    }
  }
}
