import { getServerEnv } from '@/lib/env'

import { createConsoleEmailAdapter } from './consoleAdapter'
import { createSmtpEmailAdapter } from './smtpAdapter'
import type { EmailAdapter } from './types'

export type { EmailAdapter, EmailMessage } from './types'

let cachedAdapter: EmailAdapter | null = null

/**
 * SMTP configured -> real delivery, any provider.
 * SMTP absent + production -> throws (env.ts already enforces this at
 * startup via getServerEnv's superRefine, so this is defense in depth).
 * SMTP absent + development -> console fallback, so local dev keeps working
 * without a mail server.
 */
export function getEmailAdapter(): EmailAdapter {
  if (cachedAdapter) {
    return cachedAdapter
  }

  const env = getServerEnv()

  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM) {
    cachedAdapter = createSmtpEmailAdapter({
      from: env.SMTP_FROM,
      host: env.SMTP_HOST,
      password: env.SMTP_PASSWORD,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
      user: env.SMTP_USER
    })
    return cachedAdapter
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMTP is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD/SMTP_FROM to send transactional email.')
  }

  cachedAdapter = createConsoleEmailAdapter()
  return cachedAdapter
}

/**
 * Test-only seam: lets tests substitute a spy/mock adapter (to assert an
 * email "was sent" without a real SMTP server) or reset back to the normal
 * resolution logic. Never used by application code.
 */
export function setEmailAdapterForTests(adapter: EmailAdapter | null) {
  cachedAdapter = adapter
}

function passwordResetEmailContent(resetUrl: string, locale: 'ar' | 'fr') {
  if (locale === 'ar') {
    return {
      html: `<p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك على Amous.</p><p><a href="${resetUrl}">إعادة تعيين كلمة المرور</a></p><p>إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.</p>`,
      subject: 'إعادة تعيين كلمة المرور الخاصة بك - Amous',
      text: `Réinitialisez votre mot de passe: ${resetUrl}`
    }
  }

  return {
    html: `<p>Vous avez demandé la réinitialisation de votre mot de passe sur Amous.</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 45 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>`,
    subject: 'Réinitialisation de votre mot de passe - Amous',
    text: `Réinitialisez votre mot de passe: ${resetUrl}`
  }
}

export async function sendPasswordResetEmail(input: { locale: 'ar' | 'fr'; resetUrl: string; to: string }) {
  const adapter = getEmailAdapter()
  const content = passwordResetEmailContent(input.resetUrl, input.locale)

  await adapter.send({
    html: content.html,
    subject: content.subject,
    text: content.text,
    to: input.to
  })
}
