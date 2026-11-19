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

type CategoryRef = { id: number | string; name?: string | null }

type CategoryDoc = {
  active?: boolean | null
  displayOrder?: number | null
  featured?: boolean | null
  id: number | string
  name?: string | null
  parent?: CategoryRef | null | number | string
  showOnHomepage?: boolean | null
  slug?: string | null
}

function parentLabel(parent: CategoryDoc['parent']) {
  if (parent && typeof parent === 'object' && typeof parent.name === 'string') {
    return parent.name
  }

  return parent ? '—' : null
}

export async function AdminCategoriesListView(props: ListViewServerProps) {
  const categories = (props.data?.docs || []) as CategoryDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/categories'

  const searchValue = queryValue(props.searchParams, 'where[name][like]')
  const parentFilter = queryValue(props.searchParams, 'where[parent][exists]')
  const activeFilter = queryValue(props.searchParams, 'where[active][equals]')
  const hasFilters = Boolean(searchValue || parentFilter || activeFilter)

  const quickFilters = [
    { active: !parentFilter && !activeFilter, href: basePath, label: 'Toutes' },
    { active: parentFilter === 'false', href: `${basePath}?where[parent][exists]=false`, label: 'Catégories parentes' },
    { active: parentFilter === 'true', href: `${basePath}?where[parent][exists]=true`, label: 'Sous-catégories' },
    { active: activeFilter === 'false', href: `${basePath}?where[active][equals]=false`, label: 'Inactives' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouvelle catégorie
            </Link>
          ) : null
        }
        description="Organisez la hiérarchie de navigation du catalogue."
        title="Catégories"
      />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[name][like]" placeholder="Rechercher une catégorie..." type="search" />
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

      {categories.length ? (
        <section aria-label="Liste des catégories" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Parent</th>
                  <th className="is-right">Ordre</th>
                  <th>Vitrine</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const id = String(category.id)
                  const parent = parentLabel(category.parent)

                  return (
                    <tr key={id}>
                      <td data-label="Catégorie">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {category.name || 'Catégorie'}
                        </Link>
                        {category.slug ? <div className="amous-order-cell__meta">{category.slug}</div> : null}
                      </td>
                      <td data-label="Parent">
                        <span className={parent ? undefined : 'amous-empty-value'}>{parent || '—'}</span>
                      </td>
                      <td className="is-right" data-label="Ordre">
                        {category.displayOrder ?? 0}
                      </td>
                      <td data-label="Vitrine">
                        <StatusBadge variant={category.showOnHomepage ? 'info' : 'neutral'}>{category.showOnHomepage ? 'Oui' : 'Non'}</StatusBadge>
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={category.active === false ? 'neutral' : 'success'}>{category.active === false ? 'Inactive' : 'Active'}</StatusBadge>
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
          description="Aucune catégorie ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les catégories de produits apparaîtront ici." title="Aucune catégorie" />
      )}
    </main>
  )
}
