import { commerceConfig } from './commerce'

/**
 * Centralized, code-level store profile for ETS AMOUS D'ÉQUIPEMENT.
 *
 * Values entered in Payload (Configuration → Boutique / site-settings) take precedence
 * when they are valid; these values are the fallback. Only add information here that
 * the business has confirmed — never placeholders.
 */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type OpeningHoursRule = {
  /** Days sharing the same time slots. */
  days: Weekday[]
  /** One or more slots in 24h "HH:MM" local time (Africa/Tunis), e.g. [{ opens: '08:00', closes: '12:30' }]. */
  slots: Array<{ opens: string; closes: string }>
}

export type StoreConfig = {
  legalName: string
  description: string
  address: {
    /** Displayed as-is (spelling taken from the store banner). */
    lines: string[]
  }
  map: {
    /**
     * Exact store coordinates, confirmed on Google Maps (right-click the store pin → copy
     * the "lat, lng" pair). The embedded map and the "Itinéraire" button are only shown once
     * this is set: address-text geocoding was checked and does NOT locate the store
     * ("Route Menzel Chaker Km 4, Sfax" is read by Google as directions Menzel Chaker → Sfax).
     */
    coordinates?: { lat: number; lng: number }
  }
  /** Public phone numbers, in display order. */
  phones: string[]
  /** Only set once the number is confirmed as an active WhatsApp line. */
  whatsappNumber?: string
  /** Only set once the address is confirmed as monitored. */
  email?: string
  /** Leave empty until the real opening hours are confirmed. Nothing is displayed or computed otherwise. */
  openingHours: OpeningHoursRule[]
  timezone: string
}

export const storeConfig: StoreConfig = {
  address: {
    lines: ['Route Manzel Cheker, KM 4', 'Sfax, Tunisie']
  },
  description: "Quincaillerie générale, outillage électrique, consommables et équipements professionnels à Sfax.",
  email: undefined,
  legalName: "ETS AMOUS D'ÉQUIPEMENT",
  map: {
    coordinates: undefined
  },
  openingHours: [],
  phones: ['+216 97 230 340', '+216 21 028 038'],
  timezone: commerceConfig.timezone,
  whatsappNumber: undefined
}
