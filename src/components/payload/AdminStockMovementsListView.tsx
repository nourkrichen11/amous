import type { ListViewServerProps } from 'payload'

import Link from 'next/link'
import { Search } from 'lucide-react'

import { AdminAutoSubmitForm } from '@/components/admin/AdminAutoSubmitForm'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { buildFilterHref, compactQuery, queryValue } from '@/components/admin/adminListViewHelpers'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminQuickFilterTabs } from '@/components/admin/AdminQuickFilterTabs'
import { stockMovementTypeOptions } from '@/collections/StockMovements'

type ProductRef = { id: number | string; name?: string | null; sku?: string | null }
type OrderRef = { id: number | string; orderNumber?: string | null }

type MovementDoc = {
  createdAt?: string | null
  id: number | string
  order?: null | number | OrderRef | string
  product?: null | number | ProductRef | string
  quantityDelta?: number | null
  reason?: string | null
  resultingQuantity?: number | null
  type?: string | null
}

const TYPE_LABELS = Object.fromEntries(stockMovementTypeOptions.map((option) => [option.value, option.label]))

function productRef(product: MovementDoc['product']): ProductRef | null {
  return product && typeof product === 'object' ? product : null
}

function orderRef(order: MovementDoc['order']): OrderRef | null {
  return order && typeof order === 'object' ? order : null
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export async function AdminStockMovementsListView(props: ListViewServerProps) {
  const movements = (props.data?.docs || []) as MovementDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/stock-movements'

  const searchValue = queryValue(props.searchParams, 'where[reason][like]')
  const typeFilter = queryValue(props.searchParams, 'where[type][equals]')
  const hasFilters = Boolean(searchValue || typeFilter)

  const quickFilters = [
    { active: !typeFilter, href: basePath, label: 'Tous' },
    { active: typeFilter === 'manual_adjustment', href: `${basePath}?where[type][equals]=manual_adjustment`, label: 'Ajustements manuels' },
    { active: typeFilter === 'return', href: `${basePath}?where[type][equals]=return`, label: 'Retours' },
    { active: typeFilter === 'restock', href: `${basePath}?where[type][equals]=restock`, label: 'Réapprovisionnements' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader description="Historique immuable des mouvements de stock, produit par produit." title="Journal de stock" />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[reason][like]" placeholder="Rechercher par motif..." type="search" />
        </label>
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[reason][like]'], searchParams: props.searchParams })}>
              Recherche : {searchValue}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {movements.length ? (
        <section aria-label="Liste des mouvements de stock" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Type</th>
                  <th className="is-right">Variation</th>
                  <th className="is-right">Résultat</th>
                  <th>Commande</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => {
                  const id = String(movement.id)
                  const product = productRef(movement.product)
                  const order = orderRef(movement.order)
                  const delta = movement.quantityDelta ?? 0

                  return (
                    <tr key={id}>
                      <td data-label="Produit">
                        {product ? (
                          <Link className="amous-order-cell__number" href={`/admin/collections/products/${product.id}`}>
                            {product.name || product.sku || String(product.id)}
                          </Link>
                        ) : (
                          '—'
                        )}
                        {movement.reason ? <div className="amous-order-cell__meta">{movement.reason}</div> : null}
                      </td>
                      <td data-label="Type">{TYPE_LABELS[movement.type ?? ''] || movement.type || '—'}</td>
                      <td className="is-right" data-label="Variation">
                        <span className={delta < 0 ? 'amous-stock-note--out_of_stock' : delta > 0 ? 'amous-stock-note--in_stock' : undefined}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </td>
                      <td className="is-right" data-label="Résultat">
                        {movement.resultingQuantity ?? '—'}
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
                      <td className="amous-order-cell__date" data-label="Date">
                        {formatDateTime(movement.createdAt)}
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
          description="Aucun mouvement ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les mouvements de stock (réservations, expéditions, retours, ajustements) apparaîtront ici." title="Aucun mouvement de stock" />
      )}
    </main>
  )
}
