import { unstable_noStore as noStore } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload/getPayload'

import type { DeliveryConfigView } from './types'

type DeliveryConfigDoc = {
  defaultDeliveryFee?: number
  estimatedDeliveryText?: string
  freeDeliveryThreshold?: number
  homeDeliveryEnabled?: boolean
  storePickupEnabled?: boolean
  supportedGovernorates?: Array<{ name?: string }>
}

export async function getDeliveryConfig(locale: Locale): Promise<DeliveryConfigView> {
  noStore()

  try {
    const payload = await getPayloadClient()
    const config = (await payload.findGlobal({
      slug: 'delivery-config',
      locale
    })) as DeliveryConfigDoc

    return {
      defaultDeliveryFee: config.defaultDeliveryFee ?? 7000,
      estimatedDeliveryText: config.estimatedDeliveryText,
      freeDeliveryThreshold: config.freeDeliveryThreshold,
      homeDeliveryEnabled: config.homeDeliveryEnabled ?? true,
      storePickupEnabled: config.storePickupEnabled ?? false,
      supportedGovernorates: config.supportedGovernorates?.map((zone) => zone.name).filter((name): name is string => Boolean(name)) ?? []
    }
  } catch {
    return {
      defaultDeliveryFee: 7000,
      homeDeliveryEnabled: true,
      storePickupEnabled: false,
      supportedGovernorates: []
    }
  }
}

export function calculateDeliveryFee(config: DeliveryConfigView, itemTotal: number, governorate: string): { cost: number; issue?: 'unsupported_delivery_zone' } {
  if (config.supportedGovernorates.length > 0) {
    const normalized = governorate.trim().toLowerCase()
    const supported = config.supportedGovernorates.some((zone) => zone.trim().toLowerCase() === normalized)

    if (!supported) {
      return { cost: 0, issue: 'unsupported_delivery_zone' }
    }
  }

  if (typeof config.freeDeliveryThreshold === 'number' && itemTotal >= config.freeDeliveryThreshold) {
    return { cost: 0 }
  }

  return { cost: config.defaultDeliveryFee }
}
