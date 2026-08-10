import { z } from 'zod'

const serverSchema = z.object({
  DATABASE_URI: z.string().min(1, 'DATABASE_URI is required. Add it to .env.local.'),
  PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET must be at least 16 characters.'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['fr', 'ar']).default('fr')
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
