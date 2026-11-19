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

type UserDoc = {
  active?: boolean | null
  createdAt?: string | null
  email?: string | null
  firstName?: string | null
  id: number | string
  lastName?: string | null
  phone?: string | null
  role?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short' }).format(date)
}

export async function AdminUsersListView(props: ListViewServerProps) {
  const users = (props.data?.docs || []) as UserDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const basePath = '/admin/collections/users'

  const searchValue = queryValue(props.searchParams, 'where[or][0][firstName][like]')
  const roleFilter = queryValue(props.searchParams, 'where[role][equals]')
  const activeFilter = queryValue(props.searchParams, 'where[active][equals]')
  const hasFilters = Boolean(searchValue || roleFilter || activeFilter)

  const quickFilters = [
    { active: !roleFilter && !activeFilter, href: basePath, label: 'Tous' },
    { active: roleFilter === 'customer', href: `${basePath}?where[role][equals]=customer`, label: 'Clients' },
    { active: roleFilter === 'admin', href: `${basePath}?where[role][equals]=admin`, label: 'Administrateurs' },
    { active: activeFilter === 'false', href: `${basePath}?where[active][equals]=false`, label: 'Inactifs' }
  ]

  return (
    <main className="amous-list-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Nouvel utilisateur
            </Link>
          ) : null
        }
        description="Clients et administrateurs ayant un compte sur Amous."
        title="Clients"
      />

      <AdminQuickFilterTabs filters={quickFilters} />

      <AdminAutoSubmitForm action={basePath} className="amous-page-toolbar">
        <label className="amous-search-input amous-page-toolbar__search">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={searchValue} name="where[or][0][firstName][like]" placeholder="Rechercher par nom, e-mail, téléphone..." type="search" />
        </label>
        <input name="where[or][1][lastName][like]" type="hidden" value={searchValue} />
        <input name="where[or][2][email][like]" type="hidden" value={searchValue} />
        <input name="where[or][3][normalizedPhone][like]" type="hidden" value={searchValue} />
        {roleFilter ? <input name="where[role][equals]" type="hidden" value={roleFilter} /> : null}
      </AdminAutoSubmitForm>

      {hasFilters ? (
        <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
          {searchValue ? (
            <Link
              className="amous-filter-chip"
              href={buildFilterHref({
                basePath,
                omit: ['where[or][0][firstName][like]', 'where[or][1][lastName][like]', 'where[or][2][email][like]', 'where[or][3][normalizedPhone][like]'],
                searchParams: props.searchParams
              })}
            >
              Recherche : {searchValue}
            </Link>
          ) : null}
          <Link className="amous-active-filters__clear" href={basePath}>
            Réinitialiser
          </Link>
        </div>
      ) : null}

      {users.length ? (
        <section aria-label="Liste des utilisateurs" className="amous-table-shell">
          <div className="amous-table-wrap">
            <table className="amous-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>E-mail</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const id = String(user.id)
                  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Utilisateur'

                  return (
                    <tr key={id}>
                      <td data-label="Client">
                        <Link className="amous-order-cell__number" href={`${basePath}/${id}`}>
                          {name}
                        </Link>
                      </td>
                      <td data-label="E-mail">{user.email || '—'}</td>
                      <td data-label="Téléphone" dir="ltr">
                        {user.phone || '—'}
                      </td>
                      <td data-label="Rôle">
                        <StatusBadge variant={user.role === 'admin' ? 'info' : 'neutral'}>{user.role === 'admin' ? 'Administrateur' : 'Client'}</StatusBadge>
                      </td>
                      <td data-label="Statut">
                        <StatusBadge variant={user.active === false ? 'neutral' : 'success'}>{user.active === false ? 'Inactif' : 'Actif'}</StatusBadge>
                      </td>
                      <td className="amous-order-cell__date" data-label="Inscrit le">
                        {formatDate(user.createdAt)}
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
          description="Aucun utilisateur ne correspond aux filtres actuels."
          title="Aucun résultat"
        />
      ) : (
        <AdminEmptyState description="Les nouveaux comptes clients apparaîtront ici." title="Aucun client" />
      )}
    </main>
  )
}
