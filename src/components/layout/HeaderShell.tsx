'use client'

import { ChevronDown, Heart, Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import type { AuthUserSummary } from '@/features/auth/types'
import { CART_UPDATED_EVENT } from '@/features/cart/events'
import type { HeaderData, HeaderNavItem } from '@/features/homepage/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type HeaderShellProps = {
  data: HeaderData
  locale: Locale
}

type HeaderStateResponse = {
  cartCount: number
  currentUser: AuthUserSummary | null
  wishlistCount: number
}

const frenchCaptureNavigation: HeaderNavItem[] = [
  { id: 'home', label: 'Accueil', url: '/fr' },
  { id: 'shop', label: 'Boutique', url: '/fr/boutique' },
  { id: 'categories', isCategoryTrigger: true, label: 'Catégories', url: '/fr/nos-categories' },
  { id: 'brands', label: 'Marques', url: '/fr/marques' },
  { id: 'offers', label: 'Offres', url: '/fr/offres' },
  { id: 'blog', label: 'Blog', url: '/fr/blog' },
  { id: 'about', label: '\u00c0 propos', url: '/fr/a-propos' },
  { id: 'contact', label: 'Contact', url: '/fr/contact' }
]

const activeRouteAliases: Record<string, string[]> = {
  about: ['/a-propos'],
  blog: ['/blog'],
  brands: ['/marques'],
  categories: ['/categories', '/nos-categories', '/c'],
  contact: ['/contact'],
  home: ['/'],
  offers: ['/offres'],
  shop: ['/boutique']
}

function normalizeNavPath(value: string) {
  const pathOnly = value.split(/[?#]/)[0] || '/'
  const withoutTrailingSlash = pathOnly.length > 1 ? pathOnly.replace(/\/+$/, '') : pathOnly

  return withoutTrailingSlash.replace(/^\/(fr|en|ar)(?=\/|$)/, '') || '/'
}

function getActivePaths(item: HeaderNavItem) {
  const configuredPaths = item.url.includes('?') || item.url.includes('#') ? [] : [normalizeNavPath(item.url)]

  return [...new Set([...configuredPaths, ...(activeRouteAliases[item.id] ?? [])])]
}

function getActiveNavItemId(pathname: string, items: HeaderNavItem[]) {
  const normalizedPath = normalizeNavPath(pathname)
  const exactMatch = items.find((item) => getActivePaths(item).includes(normalizedPath))

  if (exactMatch) {
    return exactMatch.id
  }

  return items.find((item) =>
    getActivePaths(item).some((href) => href !== '/' && normalizedPath.startsWith(`${href}/`))
  )?.id
}

function HeaderLogo({ locale, logoUrl, siteLabel }: { locale: Locale; logoUrl?: string; siteLabel: string }) {
  return (
    <Link
      aria-label={siteLabel}
      className="inline-flex min-h-[52px] items-center rounded-sm text-[var(--color-text)]"
      href={`/${locale}`}
    >
      {logoUrl ? (
        <span className="relative block h-[52px] w-[112px] shrink-0 overflow-hidden rounded-lg bg-[var(--color-secondary)] p-3">
          <Image alt={siteLabel} className="object-contain object-center" fill sizes="112px" src={logoUrl} unoptimized />
        </span>
      ) : (
        <span className="text-2xl font-black tracking-normal text-[var(--color-primary)]">Amous</span>
      )}
    </Link>
  )
}

function HeaderIconButton({
  badge,
  children,
  href,
  label,
  text
}: {
  badge?: number
  children: ReactNode
  href?: string
  label: string
  text?: string
}) {
  const className =
    'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-sm text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]'

  const badgeValue = typeof badge === 'number' ? Math.max(0, Math.min(badge, 99)) : undefined

  const content = (
    <>
      {children}
      {text ? <span className="text-base font-medium">{text}</span> : null}
      {typeof badgeValue === 'number' ? (
        <span className="absolute -end-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[11px] font-bold text-white">
          {badgeValue}
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link aria-label={label} className={className} href={href}>
        {content}
      </Link>
    )
  }

  return (
    <button aria-label={label} className={className} type="button">
      {content}
    </button>
  )
}

export function HeaderShell({ data, locale }: HeaderShellProps) {
  const pathname = usePathname() || `/${locale}`
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<AuthUserSummary | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasDrawerOpen = useRef(false)

  const isRtl = locale === 'ar'
  const logoUrl = '/logo2.jpg'
  const searchPlaceholder = locale === 'fr' ? 'Rechercher...' : data.searchPlaceholder
  const desktopNav = useMemo(
    () => (locale === 'fr' ? frenchCaptureNavigation : data.navigationItems.slice(0, 9)),
    [data.navigationItems, locale]
  )
  const activeNavId = useMemo(() => getActiveNavItemId(pathname, desktopNav), [desktopNav, pathname])
  const accountHref = currentUser ? `/${locale}/mon-compte` : `/${locale}/connexion`
  const accountText = currentUser ? 'Mon compte' : locale === 'fr' ? 'Se connecter' : t(locale, 'navigation.account')

  useEffect(() => {
    if (typeof fetch !== 'function') {
      return
    }

    const controller = new AbortController()

    const loadHeaderState = async () => {
      try {
        const response = await fetch('/api/storefront/header-state', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as Partial<HeaderStateResponse>

        if (typeof payload.cartCount === 'number') {
          setCartCount(payload.cartCount)
        }

        setCurrentUser(payload.currentUser ?? null)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Unable to load header state', error)
        }
      }
    }

    void loadHeaderState()

    // Add-to-cart redirects are soft navigations, so the header does not remount:
    // refresh the count when the page signals a cart change.
    const onCartUpdated = () => void loadHeaderState()
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated)

    return () => {
      controller.abort()
      window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated)
    }
  }, [])

  useEffect(() => {
    if (!data.stickyHeaderEnabled) {
      return
    }

    const handleScroll = () => {
      setCompact(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [data.stickyHeaderEnabled])

  useEffect(() => {
    if (!drawerOpen) {
      if (wasDrawerOpen.current) {
        triggerRef.current?.focus()
      }
      wasDrawerOpen.current = false
      return
    }

    wasDrawerOpen.current = true
    closeRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => document.removeEventListener('keydown', handleEscape)
  }, [drawerOpen])

  return (
    <header
      className={[
        data.stickyHeaderEnabled ? 'sticky top-0 z-40' : 'relative',
        'border-b border-[var(--color-border)] bg-white'
      ].join(' ')}
      data-compact={compact}
    >
      <div
        className={[
          'container-wide transition-[padding] duration-200',
          compact ? 'py-2 md:py-0' : 'py-3 md:py-0'
        ].join(' ')}
      >
        <div className="grid items-center gap-3 md:min-h-[76px] md:grid-cols-[auto_minmax(16rem,1fr)_auto] md:gap-7">
          <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
            <button
              aria-expanded={drawerOpen}
              aria-label={t(locale, 'navigation.menu')}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-[var(--color-border)] bg-white md:hidden"
              ref={triggerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu aria-hidden="true" size={22} />
            </button>
            <HeaderLogo locale={locale} logoUrl={logoUrl} siteLabel="Amous" />
            {data.showCart ? (
              <div className="md:hidden">
                <HeaderIconButton badge={cartCount} href={`/${locale}/panier`} label={t(locale, 'navigation.cart')}>
                  <ShoppingCart aria-hidden="true" size={20} />
                </HeaderIconButton>
              </div>
            ) : null}
          </div>

          <form action={`/${locale}/recherche`} className="hidden md:block">
            <label className="sr-only" htmlFor="header-search-desktop">
              {t(locale, 'navigation.search')}
            </label>
            <div className="mx-auto flex min-h-[46px] w-full max-w-[880px] items-center rounded-lg border border-[#d9dee7] bg-white px-4 shadow-[0_1px_0_rgb(15_23_42/0.03)]">
              <Search aria-hidden="true" className="me-3 shrink-0 text-[#98a2b3]" size={20} strokeWidth={2} />
              <input
                className="w-full bg-transparent text-base text-[var(--color-text)] outline-none placeholder:text-[#667085] [unicode-bidi:plaintext]"
                dir="auto"
                id="header-search-desktop"
                name="q"
                placeholder={searchPlaceholder}
                type="search"
              />
              <span aria-hidden="true" className="ms-4 hidden items-center gap-1 lg:flex">
                <kbd className="rounded-md border border-[#d9dee7] bg-[#f8fafc] px-2 py-1 font-mono text-xs text-[#667085] shadow-sm">Ctrl</kbd>
                <kbd className="rounded-md border border-[#d9dee7] bg-[#f8fafc] px-2 py-1 font-mono text-xs text-[#667085] shadow-sm">K</kbd>
              </span>
            </div>
          </form>

          <div className="hidden items-center justify-end gap-4 md:flex">
            {data.showAccount ? (
              <HeaderIconButton href={accountHref} label={t(locale, 'navigation.account')} text={accountText}>
                <UserRound aria-hidden="true" size={25} strokeWidth={2} />
              </HeaderIconButton>
            ) : null}
            {data.showWishlist ? (
              <HeaderIconButton label={t(locale, 'navigation.wishlist')}>
                <Heart aria-hidden="true" size={33} strokeWidth={2} />
              </HeaderIconButton>
            ) : null}
            {data.showCart ? (
              <HeaderIconButton badge={cartCount} href={`/${locale}/panier`} label={t(locale, 'navigation.cart')}>
                <ShoppingCart aria-hidden="true" size={31} strokeWidth={2} />
              </HeaderIconButton>
            ) : null}
          </div>
        </div>

        <form action={`/${locale}/recherche`} className="mt-3 md:hidden">
          <label className="sr-only" htmlFor="header-search-mobile">
            {t(locale, 'navigation.search')}
          </label>
          <div className="flex min-h-[48px] items-center rounded-lg border border-[var(--color-border)] bg-white px-3 shadow-[var(--shadow-subtle)]">
            <Search aria-hidden="true" className="me-2 shrink-0 text-[var(--color-text-muted)]" size={18} />
            <input
              className="w-full bg-transparent text-[15px] outline-none [unicode-bidi:plaintext]"
              dir="auto"
              id="header-search-mobile"
              name="q"
              placeholder={searchPlaceholder}
              type="search"
            />
          </div>
        </form>

        <nav
          aria-label={t(locale, 'navigation.primary')}
          className={[
            'hidden border-t border-[var(--color-border)] md:block',
            compact ? 'pt-0' : 'pt-0'
          ].join(' ')}
        >
          <ul className="flex flex-wrap items-center gap-x-0 gap-y-1">
            {desktopNav.map((item) => {
              const active = item.id === activeNavId

              return (
                <li key={item.id}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    aria-haspopup={item.isCategoryTrigger ? 'menu' : undefined}
                    className={[
                      'relative inline-flex min-h-[54px] items-center gap-1.5 px-4 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[var(--color-primary)] after:transition-transform lg:px-5 lg:text-base',
                      active
                        ? 'text-[var(--color-primary)] after:scale-x-100'
                        : 'text-[var(--color-text)] hover:text-[var(--color-primary)]'
                    ].join(' ')}
                    data-mega-menu-trigger={item.isCategoryTrigger ? 'true' : undefined}
                    href={item.url}
                  >
                    <span>{item.label}</span>
                    {item.isCategoryTrigger ? <ChevronDown aria-hidden="true" className={isRtl ? 'rotate-180' : ''} size={16} /> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45" onClick={() => setDrawerOpen(false)}>
          <aside
            aria-label={t(locale, 'navigation.menu')}
            aria-modal="true"
            className={[
              'absolute top-0 flex h-full w-[min(90vw,24rem)] flex-col border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl',
              isRtl ? 'right-0 border-l' : 'left-0 border-r'
            ].join(' ')}
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4">
              <HeaderLogo locale={locale} logoUrl={logoUrl} siteLabel="Amous" />
              <button
                aria-label={t(locale, 'common.close')}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-[var(--color-border)]"
                ref={closeRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <nav aria-label={t(locale, 'navigation.primary')} className="overflow-y-auto px-4 py-4">
              <ul className="grid gap-2">
                {data.showAccount ? (
                  <li>
                    <Link
                      className="flex min-h-[48px] items-center justify-between rounded-sm border border-[var(--color-border)] px-3 text-base font-medium"
                      href={accountHref}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span>{accountText}</span>
                    </Link>
                  </li>
                ) : null}
                {desktopNav.map((item) => {
                  const active = item.id === activeNavId

                  return (
                    <li key={item.id}>
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'flex min-h-[48px] items-center justify-between rounded-sm border px-3 text-base font-medium',
                          active
                            ? 'border-[var(--color-text)] bg-[color:color-mix(in_srgb,var(--color-primary)_10%,white_90%)]'
                            : 'border-[var(--color-border)]'
                        ].join(' ')}
                        href={item.url}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <span>{item.label}</span>
                        {item.isCategoryTrigger ? <ChevronDown aria-hidden="true" size={18} /> : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  )
}
