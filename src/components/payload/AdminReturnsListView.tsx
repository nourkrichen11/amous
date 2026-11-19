import type { ListViewServerProps } from 'payload'

import Link from 'next/link'
import { Search } from 'lucide-react'

import { AdminAutoSubmitForm } from '@/components/admin/AdminAutoSubmitForm'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { buildFilterHref, compactQuery, queryValue } from '@/components/admin/adminListViewHelpers'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminQuickFilterTabs } from '@/components/admin/AdminQuickFilterTabs'
import { MetricCard } from '@/components/admin/MetricCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getReturnsListKpis } from '@/features/admin/returnsKpis'
import { getRefundStatusLabel, getReturnStatusLabel } from '@/features/returns/status'

type OrderRef = { customerFirstName?: string | null; customerLastName?: string | null; id: number | string; orderNumber?: string | null }

type ReturnDoc = {
  createdAt?: string | null
  id: number | string
  items?: Array<{ quantity?: number | null }>
  order?: OrderRef | number | string | null
  refundStatus?: string | null
  returnNumber?: string | null
  status?: string | null
}

const STATUS_TONE: Record<string, 'danger' | 'info' | 'neutral' | 'success' | 'warning'> = {
  approved: 'info',
  completed: 'success',
  received: 'success',
  refunded: 'success',
  rejected: 'danger',
  requested: 'warning'
}

function statusTone(value?: string | null) {
  return STATUS_TONE[value ?? ''] ?? 'neutral'
}

function orderRef(order: ReturnDoc['order']): OrderRef | null {
  return order && typeof order === 'object' ? order : null
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short' }).format(date)
}

export async function AdminReturnsListView(props: ListViewServerProps) {
  const returns = (props.data?.docs || []) as ReturnDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/returns'

  const searchValue = queryValue(props.searchParams, 'where[returnNumber][like]')
  const statusFilter = queryValue(props.searchParams, 'where[status][equals]')
  const hasFilters = Boolean(searchValue || statusFilter)

  const quickFilters = [
    { active: !statusFilter, href: basePath, label: 'Toutes' },
    { active: statusFilter === 'requested', href: `${basePath}?where[status][equals]=requested`, label: 'Demandées' },
    { active: statusFilter === 'approved', href: `${basePath}?where[status][equals]=approved`, label: 'Approuvées' },
    { active: statusFilter === 'received', href: `${basePath}?where[status][equals]=received`, label: 'Reçues' },
    { active: statusFilter === 'completed', href: `${basePath}?where[status][equals]=completed`, label: 'Terminées' }
  ]

  const kpis = await getReturnsListKpis()

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--secondary" href={props.newDocumentURL}>
              Créer un retour
            </Link>
          ) : null
        }
        description="Suivez et traitez les demandes de retour clients."
        title="Retours"
      />

      <div className="amous-list-kpis">
        <MetricCard label="Demandées" value={kpis.requested} />
        <MetricCard label="À traiter" value={kpis.toProcess} />
        <MetricCard label="Reçues" value={kpis.received} />
      </div>

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[returnNumber][like]" placeholder="Rechercher par numéro de retour..." type="search" />
        </label>
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[returnNumber][like]'], searchParams: props.searchParams })}>
              Recherche : {searchValue}
            </Link>
          ) : null}
          {statusFilter ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[status][equals]'], searchParams: props.searchParams })}>
              Statut : {getReturnStatusLabel(statusFilter)}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {returns.length ? (
        <section aria-label="Liste des retours" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Retour</th>
                  <th>Commande</th>
                  <th>Client</th>
                  <th className="is-right">Articles</th>
                  <th>Statut</th>
                  <th>Remboursement</th>
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => {
                  const id = String(ret.id)
                  const order = orderRef(ret.order)
                  const customerName = order ? `${order.customerFirstName ?? ''} ${order.customerLastName ?? ''}`.trim() : ''
                  const articleCount = (ret.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)

                  return (
                    <tr key={id}>
                      <td data-label="Retour">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {ret.returnNumber || id}
                        </Link>
                      </td>
                      <td data-label="Commande">
                        {order ? (
                          <Link className="amous-order-cell__number" href={`/admin/collections/orders/${order.id}`}>
                            {order.orderNumber || String(order.id)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td data-label="Client">{customerName || '—'}</td>
                      <td className="is-right" data-label="Articles">
                        {articleCount}
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={statusTone(ret.status)}>{getReturnStatusLabel(ret.status ?? undefined)}</StatusBadge>
                      </td>
                      <td data-label="Remboursement">
                        <StatusBadge variant={statusTone(ret.refundStatus)}>{getRefundStatusLabel(ret.refundStatus ?? undefined)}</StatusBadge>
                      </td>
                      <td className="amous-order-cell__date" data-label="Créé le">
                        {formatDate(ret.createdAt)}
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
          description="Aucun retour ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les demandes de retour apparaîtront ici." title="Aucun retour" />
      )}
    </main>
  )
}
