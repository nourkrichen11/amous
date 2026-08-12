import type { Migration } from 'payload'

export const name = '20260812_amous_admin_foundation'

export const up: Migration['up'] = async () => {
  // Non-destructive migration marker.
  //
  // This release introduces additive Payload collections and nullable/defaulted
  // fields for the AMOUS admin foundation. Payload's Postgres adapter owns the
  // generated DDL for these collection/field definitions; this migration marks
  // the rollout boundary so production environments can move away from relying
  // on implicit development auto-sync only.
}

export const down: Migration['down'] = async () => {
  // Intentionally no destructive rollback. Existing products, customers, orders,
  // addresses and historical order references must remain valid.
}
