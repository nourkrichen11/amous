import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@payload-config': new URL('./src/payload.config.ts', import.meta.url).pathname
    }
  }
})
