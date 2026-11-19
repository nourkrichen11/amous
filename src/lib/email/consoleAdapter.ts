import type { EmailAdapter, EmailMessage } from './types'

/**
 * Local-development-only fallback, used exclusively when SMTP isn't
 * configured AND NODE_ENV !== 'production' (see getEmailAdapter in
 * src/lib/email/index.ts — production throws instead of ever reaching this).
 * Lets a developer see and follow a reset link without a real mail server.
 * This is a deliberate, narrow exception to "never log reset tokens": it
 * only ever runs on a developer's own machine, never in a deployed
 * environment, since production has no path to this adapter.
 */
export function createConsoleEmailAdapter(): EmailAdapter {
  return {
    async send(message: EmailMessage) {
      console.warn(
        [
          '[dev email] SMTP is not configured — printing the email instead of sending it.',
          `To: ${message.to}`,
          `Subject: ${message.subject}`,
          message.text || message.html
        ].join('\n')
      )
    }
  }
}
