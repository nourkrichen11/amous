import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

export const LOCK_NS = {
  IDEMPOTENCY_KEY: 1003,
  ORDER: 1002,
  PRODUCT: 1001,
  RETURN: 1004
} as const

/**
 * Acquires a Postgres transaction-scoped advisory lock on the same drizzle
 * transaction Payload's `beginTransaction()`/`req.transactionID` already threads
 * through the codebase. Released automatically on commit/rollback. Requires no
 * knowledge of Payload's generated table/column names, unlike a raw conditional
 * UPDATE, so the surrounding read-modify-write keeps going through the normal
 * Payload local API (field hooks, overrideAccess, etc. all keep working).
 */
export async function lockRow(payload: Payload, transactionID: number | string, namespace: number, key: number) {
  const adapter = payload.db as unknown as PostgresAdapter
  const session = adapter.sessions[String(transactionID)]

  if (!session) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  await session.db.execute(sql`select pg_advisory_xact_lock(${namespace}, ${key})`)
}

/**
 * Same as `lockRow` but for a lock keyed by an arbitrary string (e.g. an
 * idempotency key) rather than a numeric id. Hashes the string to an int4 via
 * Postgres's own `hashtext()` so the hash is computed consistently regardless
 * of JS string-hashing choices, and is never persisted.
 */
export async function lockHashedKey(payload: Payload, transactionID: number | string, namespace: number, key: string) {
  const adapter = payload.db as unknown as PostgresAdapter
  const session = adapter.sessions[String(transactionID)]

  if (!session) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  await session.db.execute(sql`select pg_advisory_xact_lock(${namespace}, hashtext(${key}))`)
}
