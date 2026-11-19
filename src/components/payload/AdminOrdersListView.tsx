import type { ListViewServerProps } from 'payload'

import Link from 'next/link'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'

import { AdminAutoSubmitForm } from '@/components/admin/AdminAutoSubmitForm'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { buildFilterHref, compactQuery, queryValue } from '@/components/admin/adminListViewHelpers'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminQuickFilterTabs } from '@/components/admin/AdminQuickFilterTabs'
import { Money } from '@/components/admin/Money'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { MetricCard } from '@/components/admin/MetricCard'
import { getAdminDashboardData } from '@/features/admin/dashboard'
import {
  confirmationStatusOptions,
  fulfillmentStatusOptions,
  getConfirmationStatusLabel,
  getFulfillmentStatusLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  paymentStatusOptions
} from '@/features/orders/status'

type OrderDoc = {
  confirmationStatus?: string | null
  createdAt?: string | null
  customerEmail?: string | null
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone?: string | null
  fulfillmentStatus?: string | null
  id: number | string
  orderNumber?: string | null
  orderStatus?: string | null
  paymentStatus?: string | null
  total?: number | null
}

const SEARCH_QUERY_KEYS = [
  'where[or][0][orderNumber][like]',
  'where[or][1][customerEmail][like]',
  'where[or][2][customerFirstName][like]',
  'where[or][3][customerLastName][like]'
]

const STATUS_TONE: Record<string, 'danger' | 'info' | 'neutral' | 'success' | 'warning'> = {
  cancelled: 'danger',
  completed: 'success',
  confirmed: 'success',
  delivered: 'success',
  delivery_failed: 'danger',
  new: 'info',
  paid: 'success',
  pending: 'warning',
  preparing: 'info',
  processing: 'info',
  ready_to_ship: 'info',
  refunded: 'neutral',
  rejected: 'danger',
  returned: 'neutral',
  shipped: 'info',
  unfulfilled: 'warning',
  unreachable: 'danger'
}

function statusTone(value?: string | null) {
  return STATUS_TONE[value ?? ''] ?? 'neutral'
}

function formatOrderDate(value?: string | null) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export async function AdminOrdersListView(props: ListViewServerProps) {
  const orders = (props.data?.docs || []) as OrderDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/orders'

  const searchValue = queryValue(props.searchParams, 'where[or][0][orderNumber][like]')
  const confirmationFilter = queryValue(props.searchParams, 'where[confirmationStatus][equals]')
  const paymentFilter = queryValue(props.searchParams, 'where[paymentStatus][equals]')
  const fulfillmentFilter = queryValue(props.searchParams, 'where[fulfillmentStatus][equals]')
  const orderStatusFilter = queryValue(props.searchParams, 'where[orderStatus][equals]')

  const hasFilters = Boolean(searchValue || confirmationFilter || paymentFilter || fulfillmentFilter || orderStatusFilter)

  const quickFilters = [
    { active: !orderStatusFilter && !confirmationFilter && !fulfillmentFilter, href: basePath, label: 'Toutes' },
    {
      active: confirmationFilter === 'pending',
      href: `${basePath}?where[confirmationStatus][equals]=pending`,
      label: 'À confirmer'
    },
    {
      active: fulfillmentFilter === 'unfulfilled',
      href: `${basePath}?where[fulfillmentStatus][equals]=unfulfilled`,
      label: 'À préparer'
    },
    { active: fulfillmentFilter === 'shipped', href: `${basePath}?where[fulfillmentStatus][equals]=shipped`, label: 'Expédiées' },
    { active: orderStatusFilter === 'cancelled', href: `${basePath}?where[orderStatus][equals]=cancelled`, label: 'Annulées' }
  ]

  const kpis = await getAdminDashboardData()

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouvelle commande
            </Link>
          ) : null
        }
        description="Gérez et suivez toutes les commandes de vos clients."
        title="Commandes"
      />

      <div className="amous-list-kpis">
        <MetricCard label="Commandes aujourd'hui" value={kpis.ordersToday} />
        <MetricCard label="À confirmer" value={kpis.toConfirm} />
        <MetricCard label="À préparer" value={kpis.toPrepare} />
        <MetricCard label="CA aujourd'hui" value={<Money amount={kpis.revenueToday} />} />
      </div>

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[or][0][orderNumber][like]" placeholder="Rechercher par numéro, client, e-mail..." type="search" />
        </label>
        <input name="where[or][1][customerEmail][like]" type="hidden" value={searchValue} />
        <input name="where[or][2][customerFirstName][like]" type="hidden" value={searchValue} />
        <input name="where[or][3][customerLastName][like]" type="hidden" value={searchValue} />
        {orderStatusFilter ? <input name="where[orderStatus][equals]" type="hidden" value={orderStatusFilter} /> : null}
        <details className="amous-more-filters">
          <summary>
            <SlidersHorizontal aria-hidden="true" size={16} />
            Filtres
          </summary>
          <div className="amous-more-filters__menu">
            <label>
              <span>Confirmation</span>
              <select aria-label="Filtrer par confirmation" defaultValue={confirmationFilter} name="where[confirmationStatus][equals]">
                <option value="">Toutes</option>
                {confirmationStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Paiement</span>
              <select aria-label="Filtrer par paiement" defaultValue={paymentFilter} name="where[paymentStatus][equals]">
                <option value="">Tous</option>
                {paymentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Traitement</span>
              <select aria-label="Filtrer par traitement" defaultValue={fulfillmentFilter} name="where[fulfillmentStatus][equals]">
                <option value="">Tous</option>
                {fulfillmentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="amous-more-filters__actions">
              <Link className="amous-admin-button amous-admin-button--secondary" href={basePath}>
                Réinitialiser
              </Link>
              <button className="amous-admin-button amous-admin-button--primary" type="submit">
                Appliquer
              </button>
            </div>
          </div>
        </details>
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: SEARCH_QUERY_KEYS, searchParams: props.searchParams })}>
              Recherche : {searchValue}
            </Link>
          ) : null}
          {confirmationFilter ? (
            <Link
              className="amous-filter-chip"
              href={buildFilterHref({ basePath, omit: ['where[confirmationStatus][equals]'], searchParams: props.searchParams })}
            >
              Confirmation : {getConfirmationStatusLabel(confirmationFilter)}
            </Link>
          ) : null}
          {paymentFilter ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[paymentStatus][equals]'], searchParams: props.searchParams })}>
              Paiement : {getPaymentStatusLabel(paymentFilter)}
            </Link>
          ) : null}
          {fulfillmentFilter ? (
            <Link
              className="amous-filter-chip"
              href={buildFilterHref({ basePath, omit: ['where[fulfillmentStatus][equals]'], searchParams: props.searchParams })}
            >
              Traitement : {getFulfillmentStatusLabel(fulfillmentFilter)}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {orders.length ? (
        <section aria-label="Liste des commandes" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th className="is-right">Total</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Traitement</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const id = String(order.id)
                  const customerName = `${order.customerFirstName ?? ''} ${order.customerLastName ?? ''}`.trim() || 'Client'

                  return (
                    <tr key={id}>
                      <td data-label="Commande">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {order.orderNumber || id}
                        </Link>
                      </td>
                      <td data-label="Client">
                        <span className="amous-order-cell__customer">{customerName}</span>
                        {order.customerEmail ? <span className="amous-order-cell__meta">{order.customerEmail}</span> : null}
                      </td>
                      <td className="is-right" data-label="Total">
                        <Money amount={typeof order.total === 'number' ? order.total : 0} />
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={statusTone(order.orderStatus)}>{getOrderStatusLabel(order.orderStatus ?? undefined)}</StatusBadge>
                      </td>
                      <td data-label="Paiement">
                        <StatusBadge variant={statusTone(order.paymentStatus)}>{getPaymentStatusLabel(order.paymentStatus ?? undefined)}</StatusBadge>
                      </td>
                      <td data-label="Traitement">
                        <StatusBadge variant={statusTone(order.fulfillmentStatus)}>{getFulfillmentStatusLabel(order.fulfillmentStatus ?? undefined)}</StatusBadge>
                      </td>
                      <td className="amous-order-cell__date" data-label="Date">
                        {formatOrderDate(order.createdAt)}
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
          description="Aucune commande ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState
          action={
            props.hasCreatePermission ? (
              <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
                <Plus aria-hidden="true" size={16} />
                Nouvelle commande
              </Link>
            ) : null
          }
          description="Les nouvelles commandes apparaîtront ici."
          title="Aucune commande"
        />
      )}
    </main>
  )
}
