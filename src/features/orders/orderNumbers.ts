import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

/**
 * Race-safe order number generation. Uses a dedicated `order_number_counters`
 * table (one row per year, created by a real migration) rather than:
 *  - a native Postgres SEQUENCE, which is non-transactional by design and
 *    would permanently burn/gap numbers on a rolled-back checkout, or
 *  - an advisory lock held for the whole checkout transaction, which would
 *    serialize every single checkout in a given year behind one lock.
 *
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` takes an ordinary
 * single-row Postgres lock for the duration of just this one statement, and
 * participates in the caller's transaction (`transactionID`), so a later
 * rollback (e.g. insufficient stock) correctly un-reserves the number too —
 * no gaps from failed attempts.
 */
export async function makeCommercialOrderNumber(payload: Payload, transactionID: number | string, date = new Date()) {
  const year = date.getFullYear()
  const prefix = `AM-${year}-`

  const adapter = payload.db as unknown as PostgresAdapter
  const session = adapter.sessions[String(transactionID)]

  if (!session) {
    throw new Error('NO_ACTIVE_TRANSACTION')
  }

  const result = await session.db.execute(sql`
    insert into order_number_counters (year, last_value)
    values (${year}, 1)
    on conflict (year) do update set last_value = order_number_counters.last_value + 1
    returning last_value
  `)

  const rows = (result as unknown as { rows: Array<{ last_value: number }> }).rows
  const next = Number(rows[0]?.last_value)

  if (!Number.isFinite(next)) {
    throw new Error('ORDER_NUMBER_GENERATION_FAILED')
  }

  return `${prefix}${String(next).padStart(6, '0')}`
}
