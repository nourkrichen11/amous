/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HeaderData } from '@/features/homepage/types'

import { HeaderShell } from './HeaderShell'

vi.mock('next/image', () => ({
  default: ({ alt, fill, priority, src, unoptimized, ...props }: Record<string, unknown>) => {
    void fill
    void priority
    void unoptimized

    return <img alt={String(alt)} src={String(src)} {...props} />
  }
}))

const pathnameState = {
  value: '/fr'
}

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameState.value
}))

const baseHeader: HeaderData = {
  announcementText: 'Livraison rapide',
  navigationItems: [
    { id: 'home', label: 'Accueil', url: '/fr' },
    { id: 'shop', label: 'Boutique', url: '/fr/boutique' },
    { id: 'categories', isCategoryTrigger: true, label: 'Catégories', url: '/fr/boutique' }
  ],
  searchPlaceholder: 'Rechercher un produit, une marque ou une référence...',
  showAccount: true,
  showCart: true,
  showWishlist: true,
  stickyHeaderEnabled: true
}

describe('HeaderShell', () => {
  beforeEach(() => {
    pathnameState.value = '/fr/boutique'
  })

  it('renders the French header with an accessible search field and active nav state', () => {
    render(<HeaderShell cartCount={2} data={baseHeader} locale="fr" />)

    expect(screen.getAllByRole('searchbox', { name: 'Recherche' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Boutique' })[0]).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link', { name: 'Panier' })[0]).toBeInTheDocument()
  })

  it('opens and closes the mobile menu, supports Escape, and returns focus to the trigger', () => {
    render(<HeaderShell cartCount={0} data={baseHeader} locale="fr" />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)

    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('uses the RTL drawer side for Arabic', () => {
    pathnameState.value = '/ar'

    render(
      <HeaderShell
        cartCount={1}
        data={{
          ...baseHeader,
          navigationItems: [
            { id: 'home', label: 'الرئيسية', url: '/ar' },
            { id: 'shop', label: 'المتجر', url: '/ar/boutique' }
          ],
          searchPlaceholder: 'ابحث عن منتج أو علامة تجارية أو مرجع...'
        }}
        locale="ar"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'القائمة' }))

    expect(screen.getByRole('dialog', { name: 'القائمة' })).toHaveClass('right-0')
    expect(screen.getAllByRole('searchbox', { name: 'البحث' })).toHaveLength(2)
  })

  it('keeps the header usable in a 320px viewport smoke test', () => {
    render(
      <div style={{ width: 320 }}>
        <HeaderShell cartCount={3} data={baseHeader} locale="fr" />
      </div>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })
})
