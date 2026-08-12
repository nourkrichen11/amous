import { getGovernorateByCode, getGovernorateByLabel } from '@/config/tunisia'

export type DeliveryRateZone = {
  active?: boolean
  baseFee?: number
  freeDeliveryThreshold?: number
  governorates?: string[]
}

export function resolveGovernorateCode(value: string) {
  return getGovernorateByCode(value)?.code ?? getGovernorateByLabel(value)?.code
}

export function calculateZoneDeliveryFee(zones: DeliveryRateZone[], itemTotal: number, governorate: string) {
  const code = resolveGovernorateCode(governorate)
  const zone = code
    ? zones.find((entry) => entry.active !== false && (entry.governorates ?? []).includes(code))
    : undefined

  if (!zone) {
    return undefined
  }

  if (typeof zone.freeDeliveryThreshold === 'number' && itemTotal >= zone.freeDeliveryThreshold) {
    return 0
  }

  return zone.baseFee ?? 0
}
