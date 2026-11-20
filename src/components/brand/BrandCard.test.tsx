/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BrandCard } from './BrandCard'
import { BrandLogo } from './BrandLogo'

vi.mock('next/image', () => ({
  default: ({ alt, fill, priority, src, unoptimized, ...props }: Record<string, unknown>) => {
    void fill
    void priority
    void unoptimized

    return <img alt={String(alt)} src={String(src)} {...props} />
  }
}))

describe('BrandCard', () => {
  it('links to the brand page and uses the name when no logo is uploaded', () => {
    render(<BrandCard brand={{ id: 1, name: 'Stanley', slug: 'stanley' }} locale="fr" />)

    const link = screen.getByRole('link', { name: /Stanley/ })
    expect(link).toHaveAttribute('href', '/fr/marques/stanley')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the logo as decorative next to the visible brand name', () => {
    const { container } = render(<BrandCard brand={{ id: 2, logo: { id: 9, url: '/media/bosch.png' }, name: 'Bosch', slug: 'bosch' }} locale="ar" />)

    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(screen.getByRole('link', { name: /Bosch/ })).toHaveAttribute('href', '/ar/marques/bosch')
    expect(screen.getByText('عرض المنتجات')).toBeInTheDocument()
  })
})

describe('BrandLogo', () => {
  it('labels a standalone logo with the localized brand name', () => {
    render(<BrandLogo brand={{ logo: { id: 9, url: '/media/bosch.png' }, name: 'Bosch' }} locale="fr" sizes="128px" />)
    expect(screen.getByRole('img', { name: 'Logo Bosch' })).toBeInTheDocument()
  })
})
