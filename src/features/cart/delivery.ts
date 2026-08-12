import type { Locale } from '@/i18n/config'
import { getGovernorateLabel, isValidGovernorate } from '@/config/tunisia'
import { STOREFRONT_REVALIDATE, STOREFRONT_TAGS, cacheByLocale } from '@/lib/cache/storefront'
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
  return cacheByLocale(
    'delivery-config',
    locale,
    async () => {
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
          supportedGovernorates:
            config.supportedGovernorates?.map((zone) => zone.name).filter((name): name is string => Boolean(name)) ?? []
        }
      } catch {
        return {
          defaultDeliveryFee: 7000,
          homeDeliveryEnabled: true,
          storePickupEnabled: false,
          supportedGovernorates: []
        }
      }
    },
    {
      revalidate: STOREFRONT_REVALIDATE.deliveryConfig,
      tags: [STOREFRONT_TAGS.deliveryConfig]
    }
  )
}

export function calculateDeliveryFee(config: DeliveryConfigView, itemTotal: number, governorate: string): { cost: number; issue?: 'unsupported_delivery_zone' } {
  if (!isValidGovernorate(governorate)) {
    return { cost: 0, issue: 'unsupported_delivery_zone' }
  }

  if (config.supportedGovernorates.length > 0) {
    const requested = getGovernorateLabel(governorate).trim().toLowerCase()
    const supported = config.supportedGovernorates.some((zone) => getGovernorateLabel(zone).trim().toLowerCase() === requested)

    if (!supported) {
      return { cost: 0, issue: 'unsupported_delivery_zone' }
    }
  }

  if (typeof config.freeDeliveryThreshold === 'number' && itemTotal >= config.freeDeliveryThreshold) {
    return { cost: 0 }
  }

  return { cost: config.defaultDeliveryFee }
}
