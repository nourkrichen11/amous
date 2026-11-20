import { z } from 'zod'

const serverSchema = z
  .object({
    DATABASE_URI: z.string().min(1, 'DATABASE_URI is required. Add it to .env.local.'),
    PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET must be at least 16 characters.'),
    BLOB_READ_WRITE_TOKEN: z.string().min(1, 'BLOB_READ_WRITE_TOKEN cannot be empty.').optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['fr', 'ar']).default('fr'),
    // Optional in development (falls back to a console-log email adapter —
    // see src/lib/email/index.ts). Required in production: transactional
    // email (password reset) cannot silently no-op in a real deployment.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((value) => value === 'true'),
    // Local-only seed script bootstrap credentials — see src/scripts/seed.ts.
    // Never used outside development; never logged.
    ALLOW_SEED: z.string().optional(),
    SEED_ADMIN_EMAIL: z.string().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    const requiredForProduction = ['BLOB_READ_WRITE_TOKEN', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'] as const

    for (const key of requiredForProduction) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            key === 'BLOB_READ_WRITE_TOKEN'
              ? 'BLOB_READ_WRITE_TOKEN is required in production so uploaded media is stored persistently.'
              : `${key} is required in production so password-reset email can actually be delivered.`,
          path: [key]
        })
      }
    }
  })

export type ServerEnv = z.infer<typeof serverSchema>

export function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env)

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `- ${issue.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }

  return parsed.data
}

export function getPublicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}
