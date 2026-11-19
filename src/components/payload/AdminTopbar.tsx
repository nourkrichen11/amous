'use client'

import { Logout, useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Bell, ChevronDown, Package, Search, ShoppingCart, Users, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import type { AdminTopbarAlert, AdminTopbarSearchResult } from '@/features/admin/topbar'
import { getAdminRouteContext } from './adminNavConfig'

type AdminTopbarControlsProps = {
  alerts?: AdminTopbarAlert[]
}

const resultGroups = [
  { icon: ShoppingCart, label: 'Commandes', type: 'order' },
  { icon: Package, label: 'Produits', type: 'product' },
  { icon: Users, label: 'Clients', type: 'customer' }
] as const

function getInitials(firstName?: string, lastName?: string, email?: string) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim()
  return (initials || email?.slice(0, 2) || 'A').toUpperCase()
}

function getAdminName(firstName?: string, lastName?: string, email?: string) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim()
  return name || email || 'Administrateur'
}

function AdminBreadcrumb() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { breadcrumb } = getAdminRouteContext(search ? `${pathname}?${search}` : pathname)

  return (
    <div aria-label="Contexte de page" className="amous-topbar__breadcrumb">
      <span>{breadcrumb}</span>
    </div>
  )
}

function AdminSearch() {
  const inputId = useId()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminTopbarSearchResult[]>([])
  const requestRef = useRef<AbortController | null>(null)
  const searchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const value = query.trim()

    requestRef.current?.abort()

    if (value.length < 2) {
      return undefined
    }

    const controller = new AbortController()
    requestRef.current = controller
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(value)}`, {
          credentials: 'include',
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const data = (await response.json()) as { results?: AdminTopbarSearchResult[] }
        setResults(Array.isArray(data.results) ? data.results : [])
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setResults([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 220)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const visibleResults = query.trim().length >= 2 ? results : []

  const selectResult = (href: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <div className="amous-topbar-search" ref={searchRef}>
      <label className="sr-only" htmlFor={inputId}>Rechercher dans l&apos;administration</label>
      <Search aria-hidden="true" size={17} />
      <input
        id={inputId}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Rechercher..."
        type="search"
        value={query}
      />
      {query ? (
        <button aria-label="Effacer la recherche" className="amous-topbar-icon-button amous-topbar-search__clear" onClick={() => setQuery('')} type="button">
          <X aria-hidden="true" size={16} />
        </button>
      ) : null}
      {isOpen && query.trim().length >= 2 ? (
        <div className="amous-topbar-popover amous-topbar-search__results" role="status">
          {isLoading ? <p className="amous-topbar-popover__empty">Recherche en cours...</p> : null}
          {!isLoading && visibleResults.length === 0 ? <p className="amous-topbar-popover__empty">Aucun resultat.</p> : null}
          {!isLoading ? resultGroups.map((group) => {
            const groupedResults = visibleResults.filter((result) => result.type === group.type)
            const Icon = group.icon

            if (!groupedResults.length) {
              return null
            }

            return (
              <div className="amous-topbar-search__group" key={group.type}>
                <p><Icon aria-hidden="true" size={14} />{group.label}</p>
                {groupedResults.map((result) => (
                  <button key={result.id} onClick={() => selectResult(result.href)} type="button">
                    <span>{result.label}</span>
                    {result.meta ? <small>{result.meta}</small> : null}
                  </button>
                ))}
              </div>
            )
          }) : null}
        </div>
      ) : null}
    </div>
  )
}

function AdminNotifications({ alerts }: { alerts: AdminTopbarAlert[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const notificationId = useId()

  return (
    <div className="amous-topbar-notifications">
      <button
        aria-controls={notificationId}
        aria-expanded={isOpen}
        aria-label={alerts.length ? `${alerts.length} alertes a consulter` : 'Aucune alerte'}
        className="amous-topbar-icon-button"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <Bell aria-hidden="true" size={18} />
        {alerts.length ? <span aria-hidden="true" className="amous-topbar-notifications__count">{alerts.length}</span> : null}
      </button>
      {isOpen ? (
        <div className="amous-topbar-popover amous-topbar-notifications__menu" id={notificationId}>
          <p className="amous-topbar-popover__title">A traiter</p>
          {alerts.map((alert) => (
            <Link className={`amous-topbar-alert amous-topbar-alert--${alert.tone}`} href={alert.href} key={alert.href} onClick={() => setIsOpen(false)}>
              <strong>{alert.count}</strong>
              <span>{alert.label}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function AdminProfile() {
  const { user } = useAuth<{ email?: string; firstName?: string; lastName?: string }>()
  const [isOpen, setIsOpen] = useState(false)
  const name = getAdminName(user?.firstName, user?.lastName, user?.email)
  const initials = getInitials(user?.firstName, user?.lastName, user?.email)

  return (
    <div className="amous-topbar-profile">
      <button aria-expanded={isOpen} className="amous-topbar-profile__trigger" onClick={() => setIsOpen((value) => !value)} type="button">
        <span aria-hidden="true" className="amous-topbar-profile__avatar">{initials}</span>
        <span className="amous-topbar-profile__identity"><strong>{name}</strong><small>Administrateur</small></span>
        <ChevronDown aria-hidden="true" size={16} />
      </button>
      {isOpen ? (
        <div className="amous-topbar-popover amous-topbar-profile__menu">
          <div className="amous-topbar-profile__summary"><strong>{name}</strong><span>Administrateur</span></div>
          <Link href="/admin/account" onClick={() => setIsOpen(false)}>Mon profil</Link>
          <Link href="/admin/globals/site-settings" onClick={() => setIsOpen(false)}>Parametres</Link>
          <div className="amous-topbar-profile__divider" />
          <Logout />
        </div>
      ) : null}
    </div>
  )
}

export function AdminTopbarControls({ alerts = [] }: AdminTopbarControlsProps) {
  return (
    <div className="amous-topbar">
      <div className="amous-topbar__context">
        <AdminBreadcrumb />
      </div>
      <div className="amous-topbar__center">
        <AdminSearch />
      </div>
      <div className="amous-topbar__tools">
        {alerts.length ? <AdminNotifications alerts={alerts} /> : null}
        <div className="amous-topbar__profile-slot"><AdminProfile /></div>
      </div>
    </div>
  )
}
