import { afterEach, describe, expect, it, vi } from 'vitest'

const ENV_KEYS = ['BLOB_READ_WRITE_TOKEN', 'DATABASE_URI', 'PAYLOAD_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'] as const

function snapshotEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = snapshot[key]
    }
  }
}

describe('getServerEnv', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('does not require SMTP outside production', async () => {
    const snapshot = snapshotEnv()
    try {
      vi.stubEnv('NODE_ENV', 'test')
      process.env.DATABASE_URI = 'postgres://test'
      process.env.PAYLOAD_SECRET = 'a'.repeat(20)
      delete process.env.SMTP_HOST
      delete process.env.SMTP_PORT
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD
      delete process.env.SMTP_FROM

      const { getServerEnv } = await import('./env')
      expect(() => getServerEnv()).not.toThrow()
    } finally {
      restoreEnv(snapshot)
    }
  })

  it('throws when SMTP is not configured in production (fail fast at startup, not silently)', async () => {
    const snapshot = snapshotEnv()
    try {
      vi.stubEnv('NODE_ENV', 'production')
      process.env.DATABASE_URI = 'postgres://test'
      process.env.PAYLOAD_SECRET = 'a'.repeat(20)
      process.env.BLOB_READ_WRITE_TOKEN = 'blob-token'
      delete process.env.SMTP_HOST
      delete process.env.SMTP_PORT
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD
      delete process.env.SMTP_FROM

      const { getServerEnv } = await import('./env')
      expect(() => getServerEnv()).toThrow(/SMTP_HOST/)
    } finally {
      restoreEnv(snapshot)
    }
  })

  it('throws when persistent media storage is not configured in production', async () => {
    const snapshot = snapshotEnv()
    try {
      vi.stubEnv('NODE_ENV', 'production')
      process.env.DATABASE_URI = 'postgres://test'
      process.env.PAYLOAD_SECRET = 'a'.repeat(20)
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user'
      process.env.SMTP_PASSWORD = 'pass'
      process.env.SMTP_FROM = 'no-reply@example.com'
      delete process.env.BLOB_READ_WRITE_TOKEN

      const { getServerEnv } = await import('./env')
      expect(() => getServerEnv()).toThrow(/BLOB_READ_WRITE_TOKEN/)
    } finally {
      restoreEnv(snapshot)
    }
  })

  it('passes in production once SMTP and persistent media storage are configured', async () => {
    const snapshot = snapshotEnv()
    try {
      vi.stubEnv('NODE_ENV', 'production')
      process.env.DATABASE_URI = 'postgres://test'
      process.env.PAYLOAD_SECRET = 'a'.repeat(20)
      process.env.BLOB_READ_WRITE_TOKEN = 'blob-token'
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user'
      process.env.SMTP_PASSWORD = 'pass'
      process.env.SMTP_FROM = 'no-reply@example.com'

      const { getServerEnv } = await import('./env')
      expect(() => getServerEnv()).not.toThrow()
    } finally {
      restoreEnv(snapshot)
    }
  })
})
