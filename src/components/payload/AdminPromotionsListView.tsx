import type { ListViewServerProps } from 'payload'

import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

import { AdminAutoSubmitForm } from '@/components/admin/AdminAutoSubmitForm'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { buildFilterHref, compactQuery, queryValue } from '@/components/admin/adminListViewHelpers'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminQuickFilterTabs } from '@/components/admin/AdminQuickFilterTabs'
import { StatusBadge } from '@/components/admin/StatusBadge'

type PromotionDoc = {
  active?: boolean | null
  endsAt?: string | null
  id: number | string
  name?: string | null
  startsAt?: string | null
  type?: string | null
  value?: number | null
}

const TYPE_LABELS: Record<string, string> = {
  fixed_amount: 'Montant fixe',
  free_shipping: 'Livraison offerte',
  percentage: 'Pourcentage'
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short' }).format(date)
}

function formatValue(type?: string | null, value?: number | null) {
  if (typeof value !== 'number') return '—'
  if (type === 'percentage') return `${value}%`
  if (type === 'free_shipping') return '—'
  return `${value.toFixed(3)} DT`
}

function isCurrentlyActive(promotion: PromotionDoc) {
  if (promotion.active === false) return false
  const now = Date.now()
  if (promotion.startsAt && new Date(promotion.startsAt).getTime() > now) return false
  if (promotion.endsAt && new Date(promotion.endsAt).getTime() < now) return false
  return true
}

export async function AdminPromotionsListView(props: ListViewServerProps) {
  const promotions = (props.data?.docs || []) as PromotionDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/promotions'

  const searchValue = queryValue(props.searchParams, 'where[name][like]')
  const activeFilter = queryValue(props.searchParams, 'where[active][equals]')
  const hasFilters = Boolean(searchValue || activeFilter)

  const quickFilters = [
    { active: !activeFilter, href: basePath, label: 'Toutes' },
    { active: activeFilter === 'true', href: `${basePath}?where[active][equals]=true`, label: 'Activées' },
    { active: activeFilter === 'false', href: `${basePath}?where[active][equals]=false`, label: 'Désactivées' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouvelle promotion
            </Link>
          ) : null
        }
        description="Configurez les remises et offres appliquées au panier."
        title="Promotions"
      />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[name][like]" placeholder="Rechercher une promotion..." type="search" />
        </label>
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[name][like]'], searchParams: props.searchParams })}>
              Recherche : {searchValue}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {promotions.length ? (
        <section aria-label="Liste des promotions" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Promotion</th>
                  <th>Type</th>
                  <th className="is-right">Valeur</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => {
                  const id = String(promotion.id)

                  return (
                    <tr key={id}>
                      <td data-label="Promotion">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {promotion.name || 'Promotion'}
                        </Link>
                      </td>
                      <td data-label="Type">{TYPE_LABELS[promotion.type ?? ''] || '—'}</td>
                      <td className="is-right" data-label="Valeur">
                        {formatValue(promotion.type, promotion.value)}
                      </td>
                      <td data-label="Début">{formatDate(promotion.startsAt)}</td>
                      <td data-label="Fin">{formatDate(promotion.endsAt)}</td>
                      <td data-label="Statut">
                        <StatusBadge variant={isCurrentlyActive(promotion) ? 'success' : 'neutral'}>
                          {isCurrentlyActive(promotion) ? 'En cours' : promotion.active === false ? 'Désactivée' : 'Planifiée / expirée'}
                        </StatusBadge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination
            basePath={basePath}
            currentPage={currentPage}
            limit={limit}
            query={compactQuery(props.searchParams)}
            totalDocs={totalDocs}
            totalPages={totalPages}
          />
        </section>
      ) : hasFilters ? (
        <AdminEmptyState
          action={
            <Link className="amous-admin-button amous-admin-button--secondary" href={basePath}>
              Réinitialiser les filtres
            </Link>
          }
          description="Aucune promotion ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les promotions créées apparaîtront ici." title="Aucune promotion" />
      )}
    </main>
  )
}
