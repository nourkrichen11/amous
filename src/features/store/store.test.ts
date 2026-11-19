import { describe, expect, it } from 'vitest'

import type { StoreConfig } from '@/config/store'
import { storeConfig } from '@/config/store'
import type { DeliveryConfigView } from '@/features/cart/types'

import { buildFooterFaq } from './faq'
import { getDirectionsUrl, getMapEmbedUrl, getStoreProfile } from './profile'

const delivery: DeliveryConfigView = {
  defaultDeliveryFee: 7000,
  estimatedDeliveryText: 'Livraison estimée sous 24 à 72 heures.',
  freeDeliveryThreshold: 150000,
  homeDeliveryEnabled: true,
  storePickupEnabled: false,
  supportedGovernorates: ['Tunis', 'Sfax']
}

describe('store profile', () => {
  it('drops CMS placeholders and falls back to the confirmed store config', () => {
    const profile = getStoreProfile({
      address: 'Tunis, Tunisie',
      email: 'contact@amous.local',
      phone: '+216 00 000 000',
      siteName: 'Amous',
      whatsappNumber: '21600000000'
    })

    expect(profile.phones.map((phone) => phone.href)).toEqual(['tel:+21697230340', 'tel:+21621028038'])
    expect(profile.addressLines).toEqual(storeConfig.address.lines)
    expect(profile.email).toBeUndefined()
    expect(profile.whatsappNumber).toBeUndefined()
    expect(profile.hasOpeningHours).toBe(false)
  })

  it('prefers valid CMS values and de-duplicates phone numbers', () => {
    const profile = getStoreProfile({ email: 'contact@amous.tn', phone: '97230340', siteName: 'Amous', whatsappNumber: '+216 97 230 340' })

    expect(profile.phones).toHaveLength(2)
    expect(profile.email).toBe('contact@amous.tn')
    expect(profile.whatsappNumber).toBe('21697230340')
  })

  it('only exposes a map and directions once confirmed coordinates are configured', () => {
    expect(getMapEmbedUrl()).toBeUndefined()
    expect(getDirectionsUrl()).toBeUndefined()

    const withCoordinates: StoreConfig = { ...storeConfig, map: { coordinates: { lat: 34.8, lng: 10.7 } } }
    expect(getMapEmbedUrl(withCoordinates)).toBe('https://www.google.com/maps?q=34.8,10.7&hl=fr&z=16&output=embed')
    expect(getDirectionsUrl(withCoordinates)).toBe('https://www.google.com/maps/dir/?api=1&destination=34.8,10.7')
    expect(getStoreProfile({ siteName: 'Amous' }, withCoordinates).mapEmbedUrl).toContain('output=embed')
  })
})

describe('footer FAQ', () => {
  it('states delivery facts straight from the delivery configuration', () => {
    const faq = buildFooterFaq(delivery)
    const answer = faq.find((item) => item.id === 'faq-livraison')?.answer.join(' ')

    expect(faq.map((item) => item.id)).toEqual(['faq-livraison', 'faq-disponibilite', 'faq-retrait', 'faq-paiement', 'faq-devis', 'faq-retours'])
    expect(answer).toContain('Tunis, Sfax')
    expect(answer).toContain('7 DT')
    expect(answer).toContain('150 DT')
  })

  it('reflects whether store pickup is enabled at checkout', () => {
    expect(buildFooterFaq(delivery).find((item) => item.id === 'faq-retrait')?.answer[0]).toMatch(/pas encore proposé/)
    expect(buildFooterFaq({ ...delivery, storePickupEnabled: true }).find((item) => item.id === 'faq-retrait')?.answer[0]).toMatch(/^Oui/)
  })
})
