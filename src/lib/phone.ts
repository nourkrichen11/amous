const tunisianMobileOrLandline = /^[24579]\d{7}$/

export function normalizePhone(phone?: string | null) {
  if (!phone) {
    return undefined
  }

  const trimmed = phone.trim()
  if (!trimmed) {
    return undefined
  }

  const digits = trimmed.replaceAll(/\D/g, '')

  if (digits.startsWith('00216') && digits.length === 13) {
    const local = digits.slice(5)
    return tunisianMobileOrLandline.test(local) ? `+216${local}` : undefined
  }

  if (digits.startsWith('216') && digits.length === 11) {
    const local = digits.slice(3)
    return tunisianMobileOrLandline.test(local) ? `+216${local}` : undefined
  }

  if (digits.length === 8) {
    return tunisianMobileOrLandline.test(digits) ? `+216${digits}` : undefined
  }

  if (trimmed.startsWith('+') && digits.length > 8) {
    return `+${digits}`
  }

  return undefined
}

export function isValidTunisianPhone(phone?: string | null) {
  const normalized = normalizePhone(phone)
  return Boolean(normalized && normalized.startsWith('+216') && normalized.length === 12)
}

export function formatPhoneForDisplay(phone?: string | null) {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    return phone?.trim() || ''
  }

  if (normalized.startsWith('+216') && normalized.length === 12) {
    return `+216 ${normalized.slice(4, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`
  }

  return normalized
}

export function phoneSearchToken(phone?: string | null) {
  return normalizePhone(phone)?.replaceAll(/\D/g, '') ?? phone?.replaceAll(/\D/g, '') ?? ''
}
