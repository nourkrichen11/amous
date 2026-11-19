import { config as loadEnv } from 'dotenv'
import { vi } from 'vitest'

// The cache-invalidation hooks (src/lib/cache/invalidation.ts) call
// next/cache's revalidateTag, which requires a Next.js request/build
// context that doesn't exist when Payload's local API runs from a plain
// Node test process. Stub it to a no-op — these tests exercise the
// order/inventory workflow, not the storefront cache layer.
vi.mock('next/cache', () => ({
  revalidateTag: () => undefined,
  unstable_cache: (fn: unknown) => fn,
  unstable_noStore: () => undefined
}))

// Must run before anything imports `@payload-config` (src/payload.config.ts),
// which validates `DATABASE_URI` via zod at module-evaluation time — by the
// time a `beforeAll` hook could run, it would already be too late.
loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

if (process.env.TEST_DATABASE_URI) {
  process.env.DATABASE_URI = process.env.TEST_DATABASE_URI
} else if (process.env.DATABASE_URI) {
  console.warn(
    '[test:integration] TEST_DATABASE_URI is not set — running against DATABASE_URI directly. ' +
      'Set TEST_DATABASE_URI to a disposable database for routine use; fixtures are scoped with a ' +
      'TEST-INTEGRATION- prefix and cleaned up, but a dedicated database is safer.'
  )
}
