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

type BrandDoc = {
  active?: boolean | null
  displayOrder?: number | null
  featured?: boolean | null
  id: number | string
  name?: string | null
  website?: string | null
}

export async function AdminBrandsListView(props: ListViewServerProps) {
  const brands = (props.data?.docs || []) as BrandDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/brands'

  const searchValue = queryValue(props.searchParams, 'where[name][like]')
  const activeFilter = queryValue(props.searchParams, 'where[active][equals]')
  const featuredFilter = queryValue(props.searchParams, 'where[featured][equals]')
  const hasFilters = Boolean(searchValue || activeFilter || featuredFilter)

  const quickFilters = [
    { active: !activeFilter && !featuredFilter, href: basePath, label: 'Toutes' },
    { active: featuredFilter === 'true', href: `${basePath}?where[featured][equals]=true`, label: 'Mises en avant' },
    { active: activeFilter === 'false', href: `${basePath}?where[active][equals]=false`, label: 'Inactives' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouvelle marque
            </Link>
          ) : null
        }
        description="Gérez les marques référencées dans le catalogue."
        title="Marques"
      />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[name][like]" placeholder="Rechercher une marque..." type="search" />
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

      {brands.length ? (
        <section aria-label="Liste des marques" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Marque</th>
                  <th>Site web</th>
                  <th className="is-right">Ordre</th>
                  <th>Mise en avant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const id = String(brand.id)

                  return (
                    <tr key={id}>
                      <td data-label="Marque">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {brand.name || 'Marque'}
                        </Link>
                      </td>
                      <td data-label="Site web">
                        <span className={brand.website ? undefined : 'amous-empty-value'}>{brand.website || '—'}</span>
                      </td>
                      <td className="is-right" data-label="Ordre">
                        {brand.displayOrder ?? 0}
                      </td>
                      <td data-label="Mise en avant">
                        <StatusBadge variant={brand.featured ? 'info' : 'neutral'}>{brand.featured ? 'Oui' : 'Non'}</StatusBadge>
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={brand.active === false ? 'neutral' : 'success'}>{brand.active === false ? 'Inactive' : 'Active'}</StatusBadge>
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
          description="Aucune marque ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les marques référencées apparaîtront ici." title="Aucune marque" />
      )}
    </main>
  )
}
