import { beforeEach, describe, expect, it } from 'vitest'

import { checkRateLimit, resetRateLimitStoreForTests } from './rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitStoreForTests()
  })

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit('register', '1.2.3.4').allowed).toBe(true)
    }
  })

  it('blocks once the bucket max is exceeded and reports a retry-after', () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit('register', '1.2.3.4')
    }

    const result = checkRateLimit('register', '1.2.3.4')
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('tracks distinct identifiers independently', () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit('register', '1.2.3.4')
    }

    expect(checkRateLimit('register', '1.2.3.4').allowed).toBe(false)
    expect(checkRateLimit('register', '5.6.7.8').allowed).toBe(true)
  })

  it('tracks distinct buckets independently for the same identifier', () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit('forgot-password', '1.2.3.4:test@example.com')
    }

    expect(checkRateLimit('forgot-password', '1.2.3.4:test@example.com').allowed).toBe(false)
    // Same identifier, different bucket — login has its own budget (10, not 5).
    expect(checkRateLimit('login', '1.2.3.4:test@example.com').allowed).toBe(true)
  })

  it('login allows more attempts than the tighter buckets before blocking', () => {
    for (let i = 0; i < 10; i += 1) {
      expect(checkRateLimit('login', 'ip:acct').allowed).toBe(true)
    }

    expect(checkRateLimit('login', 'ip:acct').allowed).toBe(false)
  })
})
