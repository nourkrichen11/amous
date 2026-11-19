import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Each test file boots its own Payload instance, and Payload's
    // dev-mode schema push (drizzle-kit) is not safe to run concurrently
    // against the same live database from multiple processes — observed
    // firsthand as transient "relation does not exist" errors when files
    // ran in parallel. The genuine concurrency scenarios this suite tests
    // (e.g. two simultaneous reservations) use Promise.all *within* a
    // single already-initialized payload client, which doesn't need
    // cross-file parallelism at all.
    fileParallelism: false,
    globals: true,
    hookTimeout: 30000,
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['./vitest.integration.setup.ts'],
    testTimeout: 30000
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@payload-config': new URL('./src/payload.config.ts', import.meta.url).pathname
    }
  }
})
