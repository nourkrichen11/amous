import { storeConfig, type StoreConfig } from '@/config/store'
import type { SiteSettingsData } from '@/features/catalogue/types'
import { getPublicAddress, getPublicEmail, getPublicPhone, getPublicWhatsappNumber } from '@/lib/contact'
import { normalizePhone } from '@/lib/phone'

import { groupOpeningHours, hasOpeningHours, type OpeningHoursRow } from './hours'

export type StoreProfile = {
  legalName: string
  description: string
  addressLines: string[]
  /** Undefined until confirmed coordinates are configured. */
  mapEmbedUrl?: string
  directionsUrl?: string
  phones: Array<{ display: string; href: string }>
  whatsappNumber?: string
  email?: string
  socialLinks: Array<{ label: string; url: string }>
  openingHours: OpeningHoursRow[]
  openingRules: StoreConfig['openingHours']
  hasOpeningHours: boolean
  timezone: string
}

export function getMapEmbedUrl(config: StoreConfig = storeConfig): string | undefined {
  const point = config.map.coordinates
  return point ? `https://www.google.com/maps?q=${point.lat},${point.lng}&hl=fr&z=16&output=embed` : undefined
}

export function getDirectionsUrl(config: StoreConfig = storeConfig): string | undefined {
  const point = config.map.coordinates
  return point ? `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}` : undefined
}

/**
 * Merges valid Payload site-settings values (first) with the confirmed store config (fallback).
 * Placeholder CMS values are discarded by the `getPublic*` helpers.
 */
export function getStoreProfile(settings: SiteSettingsData, config: StoreConfig = storeConfig): StoreProfile {
  const phones: StoreProfile['phones'] = []
  const seen = new Set<string>()

  ;[settings.phone, ...config.phones].forEach((value) => {
    const phone = getPublicPhone(value)
    const key = normalizePhone(value)

    if (phone && key && !seen.has(key)) {
      seen.add(key)
      phones.push(phone)
    }
  })

  const cmsAddress = getPublicAddress(settings.address)

  return {
    addressLines: cmsAddress ? cmsAddress.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : config.address.lines,
    description: config.description,
    directionsUrl: getDirectionsUrl(config),
    email: getPublicEmail(settings.email) ?? getPublicEmail(config.email),
    hasOpeningHours: hasOpeningHours(config.openingHours),
    legalName: config.legalName,
    mapEmbedUrl: getMapEmbedUrl(config),
    openingHours: groupOpeningHours(config.openingHours),
    openingRules: config.openingHours,
    phones,
    socialLinks: settings.socialLinks ?? [],
    timezone: config.timezone,
    whatsappNumber: getPublicWhatsappNumber(settings.whatsappNumber) ?? getPublicWhatsappNumber(config.whatsappNumber)
  }
}
