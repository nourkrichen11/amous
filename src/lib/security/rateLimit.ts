/**
 * In-memory, single-process rate limiter. Deliberately simple for an
 * initial single-instance deployment — swap `store` for a Redis-backed
 * implementation behind the same `checkRateLimit`/`RateLimitBucket` surface
 * if this app ever runs on multiple instances; nothing at the call sites
 * (auth routes/actions) would need to change.
 */
export type RateLimitBucket = 'change-password' | 'forgot-password' | 'login' | 'register' | 'reset-password'

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

const LIMITS: Record<RateLimitBucket, { max: number; windowMs: number }> = {
  'change-password': { max: 10, windowMs: 60 * 60 * 1000 },
  'forgot-password': { max: 5, windowMs: 60 * 60 * 1000 },
  login: { max: 10, windowMs: 15 * 60 * 1000 },
  register: { max: 5, windowMs: 60 * 60 * 1000 },
  'reset-password': { max: 10, windowMs: 60 * 60 * 1000 }
}

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Bounds unbounded memory growth from one-off keys (e.g. scattered IPs)
// that are never hit again after their window naturally expires.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupScheduled() {
  if (cleanupTimer || typeof setInterval !== 'function') {
    return
  }

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)

  // Don't hold the Node process open just for cleanup.
  cleanupTimer.unref?.()
}

/**
 * Checks and consumes one attempt for `bucket:identifier`. Callers should
 * combine an IP with an account identifier (email) so the limit can't be
 * trivially bypassed by rotating either alone, and — combined with every
 * caller already returning the same generic message regardless of outcome —
 * never reveals whether the identifier corresponds to a real account.
 */
export function checkRateLimit(bucket: RateLimitBucket, identifier: string): RateLimitResult {
  ensureCleanupScheduled()

  const limit = LIMITS[bucket]
  const key = `${bucket}:${identifier}`
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit.max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/** Test-only: clears all counters so test cases don't bleed into each other. */
export function resetRateLimitStoreForTests() {
  store.clear()
}
