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

type PromotionRef = { id: number | string; name?: string | null }

type CouponDoc = {
  active?: boolean | null
  code?: string | null
  id: number | string
  promotion?: null | number | PromotionRef | string
  usageLimit?: number | null
  usedCount?: number | null
}

function promotionLabel(promotion: CouponDoc['promotion']) {
  if (promotion && typeof promotion === 'object' && typeof promotion.name === 'string') {
    return promotion.name
  }

  return null
}

export async function AdminCouponCodesListView(props: ListViewServerProps) {
  const coupons = (props.data?.docs || []) as CouponDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/coupon-codes'

  const searchValue = queryValue(props.searchParams, 'where[code][like]')
  const activeFilter = queryValue(props.searchParams, 'where[active][equals]')
  const hasFilters = Boolean(searchValue || activeFilter)

  const quickFilters = [
    { active: !activeFilter, href: basePath, label: 'Tous' },
    { active: activeFilter === 'true', href: `${basePath}?where[active][equals]=true`, label: 'Actifs' },
    { active: activeFilter === 'false', href: `${basePath}?where[active][equals]=false`, label: 'Inactifs' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouveau code
            </Link>
          ) : null
        }
        description="Créez et suivez l'utilisation des codes promo."
        title="Codes promo"
      />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[code][like]" placeholder="Rechercher un code..." type="search" />
        </label>
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link className="amous-filter-chip" href={buildFilterHref({ basePath, omit: ['where[code][like]'], searchParams: props.searchParams })}>
              Recherche : {searchValue}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {coupons.length ? (
        <section aria-label="Liste des codes promo" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Promotion</th>
                  <th className="is-right">Utilisations</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const id = String(coupon.id)
                  const promotion = promotionLabel(coupon.promotion)
                  const used = coupon.usedCount ?? 0
                  const limitLabel = typeof coupon.usageLimit === 'number' ? `${used} / ${coupon.usageLimit}` : `${used} / ∞`

                  return (
                    <tr key={id}>
                      <td data-label="Code">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {coupon.code || 'Code'}
                        </Link>
                      </td>
                      <td data-label="Promotion">
                        <span className={promotion ? undefined : 'amous-empty-value'}>{promotion || '—'}</span>
                      </td>
                      <td className="is-right" data-label="Utilisations">
                        {limitLabel}
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={coupon.active === false ? 'neutral' : 'success'}>{coupon.active === false ? 'Inactif' : 'Actif'}</StatusBadge>
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
          description="Aucun code promo ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les codes promo créés apparaîtront ici." title="Aucun code promo" />
      )}
    </main>
  )
}
