import { headers } from 'next/headers'

/**
 * Trusts `x-forwarded-for`/`x-real-ip` from the deployment's own reverse
 * proxy (required in front of a Next.js app on a platform like OVH). If this
 * app is ever exposed directly with no trusted proxy in front of it, these
 * headers become attacker-controlled and this function should be revisited.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return headerStore.get('x-real-ip') || 'unknown'
}
