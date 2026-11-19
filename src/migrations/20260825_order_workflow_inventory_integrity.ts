import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const name = '20260825_order_workflow_inventory_integrity'

/**
 * Real DDL, unlike the previous no-op marker migration
 * (20260812_amous_admin_foundation). Supports the Order Workflow /
 * Inventory Service rewrite:
 *
 * 1. `order_number_counters` — one row per year, atomically incremented
 *    inside the checkout transaction (see src/features/orders/orderNumbers.ts)
 *    so order-number generation is race-safe under concurrent checkouts
 *    without gapping numbers on a rolled-back checkout.
 * 2. `returns_items.restocked` — tracks, per return line, whether that
 *    line's stock has already been physically restored, so the returns
 *    workflow (src/features/returns/workflow.ts) can guarantee "exactly
 *    once" restocking.
 * 3. CHECK constraints on `products` as a second, independent line of
 *    defense against corrupt inventory data (belt-and-suspenders alongside
 *    the advisory-lock concurrency fix in src/features/inventory/service.ts
 *    — a future bug in a new code path shouldn't be able to write an
 *    invalid row even if it forgets to lock).
 *
 * Before adding the cross-column constraint, this migration checks for
 * existing violations and throws a descriptive error instead of letting the
 * ALTER TABLE fail with a cryptic Postgres error — per project policy, data
 * inconsistencies are reported, not silently repaired.
 */
export const up = async ({ db }: MigrateUpArgs) => {
  if (!db) {
    throw new Error('MIGRATION_REQUIRES_DB')
  }

  await db.execute(sql`
    create table if not exists order_number_counters (
      year integer primary key,
      last_value integer not null default 0
    )
  `)

  await db.execute(sql`
    alter table returns_items
    add column if not exists restocked boolean not null default false
  `)

  const negativeStock = await db.execute(sql`
    select count(*)::int as count from products where stock_quantity < 0 or reserved_stock < 0
  `)
  const negativeStockCount = Number((negativeStock as unknown as { rows: Array<{ count: number }> }).rows[0]?.count ?? 0)

  if (negativeStockCount > 0) {
    throw new Error(
      `MIGRATION_ABORTED: ${negativeStockCount} product row(s) have negative stock_quantity/reserved_stock. ` +
        'Reconcile this data before re-running the migration.'
    )
  }

  const overReserved = await db.execute(sql`
    select count(*)::int as count from products where reserved_stock > stock_quantity
  `)
  const overReservedCount = Number((overReserved as unknown as { rows: Array<{ count: number }> }).rows[0]?.count ?? 0)

  if (overReservedCount > 0) {
    throw new Error(
      `MIGRATION_ABORTED: ${overReservedCount} product row(s) have reserved_stock > stock_quantity. ` +
        'Reconcile this data before re-running the migration.'
    )
  }

  await db.execute(sql`
    alter table products
    add constraint products_stock_quantity_non_negative check (stock_quantity >= 0)
  `)
  await db.execute(sql`
    alter table products
    add constraint products_reserved_stock_non_negative check (reserved_stock >= 0)
  `)
  await db.execute(sql`
    alter table products
    add constraint products_reserved_stock_le_stock_quantity check (reserved_stock <= stock_quantity)
  `)
}

export const down = async ({ db }: MigrateDownArgs) => {
  if (!db) {
    throw new Error('MIGRATION_REQUIRES_DB')
  }

  await db.execute(sql`alter table products drop constraint if exists products_reserved_stock_le_stock_quantity`)
  await db.execute(sql`alter table products drop constraint if exists products_reserved_stock_non_negative`)
  await db.execute(sql`alter table products drop constraint if exists products_stock_quantity_non_negative`)
  await db.execute(sql`alter table returns_items drop column if exists restocked`)
  await db.execute(sql`drop table if exists order_number_counters`)
}
