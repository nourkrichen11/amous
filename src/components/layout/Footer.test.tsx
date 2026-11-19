/* eslint-disable @next/next/no-img-element */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Footer } from './Footer'

vi.mock('next/image', () => ({
  default: ({ alt, fill, priority, src, unoptimized, ...props }: Record<string, unknown>) => {
    void fill
    void priority
    void unoptimized

    return <img alt={String(alt)} src={String(src)} {...props} />
  }
}))

const delivery = {
  defaultDeliveryFee: 7000,
  freeDeliveryThreshold: 150000,
  homeDeliveryEnabled: true,
  storePickupEnabled: false,
  supportedGovernorates: ['Tunis', 'Sfax']
}

describe('Footer', () => {
  it('shows confirmed store contacts and never the seeded placeholders', () => {
    const { container } = render(
      <Footer
        delivery={delivery}
        locale="fr"
        settings={{ address: 'Tunis, Tunisie', email: 'contact@amous.local', phone: '+216 00 000 000', siteName: 'Amous', whatsappNumber: '21600000000' }}
      />
    )

    expect(screen.getByRole('link', { name: 'Appeler le +216 97 230 340' })).toHaveAttribute('href', 'tel:+21697230340')
    expect(screen.getByRole('link', { name: 'Appeler le +216 21 028 038' })).toHaveAttribute('href', 'tel:+21621028038')
    expect(container.textContent).not.toMatch(/00 000 000|amous\.local|Tunis, Tunisie/)
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText(/Appelez-nous pour connaître nos horaires/)).toBeInTheDocument()
  })

  it('renders the store address, FAQ accordion and navigation', () => {
    render(<Footer delivery={delivery} locale="fr" settings={{ siteName: 'Amous' }} />)

    // No confirmed coordinates yet: never show an unverified map or directions.
    expect(screen.queryByTitle(/Carte : emplacement/)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Itinéraire/ })).not.toBeInTheDocument()
    expect(screen.getByText('Route Manzel Cheker, KM 4')).toBeInTheDocument()

    const faq = screen.getByRole('region', { name: 'Questions fréquentes' })
    expect(within(faq).getAllByRole('group')).toHaveLength(6)
    expect(within(faq).getByText('Livrez-vous en Tunisie ?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Poser une question/ })).toHaveAttribute('href', 'tel:+21697230340')

    const shop = screen.getByRole('navigation', { name: 'Boutique' })
    expect(within(shop).getByRole('link', { name: 'Tous les produits' })).toHaveAttribute('href', '/fr/boutique')
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} ETS AMOUS`))).toBeInTheDocument()
  })
})
