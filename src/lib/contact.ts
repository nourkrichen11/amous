import { formatPhoneForDisplay, normalizePhone } from './phone'

/**
 * Contact details coming from the CMS can still hold seed/demo values
 * (e.g. "+216 00 000 000", "contact@amous.local"). Those must never reach the
 * public storefront, so every value is checked before it is exposed.
 */

const RESERVED_EMAIL_DOMAINS = [/\.local$/i, /\.localhost$/i, /\.test$/i, /\.example$/i, /\.invalid$/i, /(^|\.)example\.(com|net|org)$/i]
const EMAIL_PATTERN = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/

function hasPlaceholderDigits(normalized: string) {
  const local = normalized.startsWith('+216') ? normalized.slice(4) : normalized.replaceAll(/\D/g, '')

  return /^(\d)\1+$/.test(local) || /^0+$/.test(local) || local === '12345678' || local === '87654321'
}

export function getPublicPhone(phone?: string | null): { display: string; href: string } | undefined {
  const normalized = normalizePhone(phone)

  if (!normalized || hasPlaceholderDigits(normalized)) {
    return undefined
  }

  return { display: formatPhoneForDisplay(normalized), href: `tel:${normalized}` }
}

/** Returns the digits expected by wa.me links, or undefined for missing/placeholder numbers. */
export function getPublicWhatsappNumber(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined
  }

  const digits = value.replaceAll(/\D/g, '')
  const normalized = normalizePhone(value) ?? normalizePhone(`+${digits}`)

  if (!normalized || hasPlaceholderDigits(normalized)) {
    return undefined
  }

  return normalized.replaceAll(/\D/g, '')
}

export function getPublicEmail(email?: string | null): string | undefined {
  const trimmed = email?.trim()
  const match = trimmed ? EMAIL_PATTERN.exec(trimmed) : null

  if (!trimmed || !match) {
    return undefined
  }

  const domain = match[1]
  return RESERVED_EMAIL_DOMAINS.some((pattern) => pattern.test(domain)) ? undefined : trimmed
}

// Default values written by src/scripts/seed.ts — a city name alone is not a verified store address.
const SEED_PLACEHOLDER_ADDRESSES = new Set(['tunis, tunisie', 'tunis', 'tunisie', 'تونس'])

export function getPublicAddress(address?: string | null): string | undefined {
  const trimmed = address?.trim()

  if (!trimmed || SEED_PLACEHOLDER_ADDRESSES.has(trimmed.toLowerCase())) {
    return undefined
  }

  return trimmed
}
