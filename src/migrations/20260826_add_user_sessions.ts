import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const name = '20260826_add_user_sessions'

/**
 * Adds the `sessions` array field Payload auto-requires once
 * `Users.auth.useSessions` is enabled (src/collections/Users.ts) — this is
 * what makes per-session revocation possible (changePassword/resetPassword
 * in src/features/auth/service.ts), instead of stateless JWTs that stay
 * valid until expiry no matter what.
 *
 * NOT generated via `payload migrate:create`: this project's schema was
 * built entirely through Payload's dev-mode auto-push and never had a real
 * baseline migration, so `migrate:create`'s diff has nothing to compare
 * against and produces a "recreate every table from scratch" script instead
 * of an incremental one. This migration instead contains only the exact
 * `users_sessions` DDL Payload's schema builder generates for this field
 * (confirmed by diffing against a throwaway full-schema dump), scoped down
 * by hand to just the new table/constraint/indexes.
 */
export const up = async ({ db }: MigrateUpArgs) => {
  if (!db) {
    throw new Error('MIGRATION_REQUIRES_DB')
  }

  await db.execute(sql`
    create table if not exists users_sessions (
      "_order" integer not null,
      "_parent_id" integer not null,
      "id" varchar primary key not null,
      "created_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone not null
    )
  `)

  // Postgres has no ADD CONSTRAINT IF NOT EXISTS — guard it explicitly.
  // Needed because Payload's own migrate/migrate:create CLI tooling can
  // additively reconcile newly-declared fields against a dev-push-created
  // database (tracked via the special "dev" marker row in
  // payload_migrations) before running pending migrations, so this table
  // may already exist by the time this migration executes.
  await db.execute(sql`
    do $$
    begin
      if not exists (select 1 from pg_constraint where conname = 'users_sessions_parent_id_fk') then
        alter table users_sessions
        add constraint users_sessions_parent_id_fk foreign key ("_parent_id") references "public"."users"("id") on delete cascade on update no action;
      end if;
    end $$
  `)

  await db.execute(sql`create index if not exists users_sessions_order_idx on users_sessions using btree ("_order")`)
  await db.execute(sql`create index if not exists users_sessions_parent_id_idx on users_sessions using btree ("_parent_id")`)
}

export const down = async ({ db }: MigrateDownArgs) => {
  if (!db) {
    throw new Error('MIGRATION_REQUIRES_DB')
  }

  await db.execute(sql`drop table if exists users_sessions cascade`)
}
