import type { ListViewServerProps } from 'payload'

import Link from 'next/link'
import { Columns3, EllipsisVertical, Package, Plus, Search, SlidersHorizontal, X } from 'lucide-react'

import { AdminAutoSubmitForm } from '@/components/admin/AdminAutoSubmitForm'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { AdminListToolbar } from '@/components/admin/AdminListToolbar'
import { buildFilterHref, compactQuery, queryValue, queryValues, sortDirection } from '@/components/admin/adminListViewHelpers'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminProductSelectionShell } from '@/components/admin/AdminProductSelectionShell'
import { Money } from '@/components/admin/Money'
import { ProductCell } from '@/components/admin/ProductCell'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getAvailableStock } from '@/features/inventory/status'

type ProductDoc = {
  active?: boolean | null
  availableStock?: number | null
  brand?: null | number | string | { id: number | string; name?: string | null }
  category?: null | number | string | { id: number | string; name?: string | null }
  id: number | string
  images?: Array<
    | number
    | string
    | {
        id: number | string
        thumbnailURL?: string | null
        url?: string | null
        sizes?: {
          thumbnail?: {
            url?: string | null
          } | null
        } | null
      }
  > | null
  manufacturerReference?: null | string
  name?: null | string
  slug?: null | string
  publicPrice?: null | number
  reservedStock?: null | number
  sku?: null | string
  stockQuantity?: null | number
  stockStatus?: null | string
}

type FilterOption = {
  id: number | string
  name?: string | null
}

const SEARCH_QUERY_KEYS = [
  'where[or][0][name][like]',
  'where[or][1][sku][like]',
  'where[or][2][manufacturerReference][like]'
]

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function relationID(value: ProductDoc['brand'] | ProductDoc['category']) {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'id' in value && (typeof value.id === 'number' || typeof value.id === 'string')) {
    return String(value.id)
  }

  return ''
}

function relatedLabel(value: ProductDoc['brand'] | ProductDoc['category'], options: FilterOption[]) {
  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
    return value.name
  }

  return options.find((option) => String(option.id) === relationID(value))?.name || '\u2014'
}

function imageURL(product: ProductDoc) {
  const firstImage = product.images?.[0]

  if (firstImage && typeof firstImage === 'object') {
    return firstImage.thumbnailURL || firstImage.sizes?.thumbnail?.url || firstImage.url || null
  }

  return null
}

function stockLabel(status?: string | null) {
  if (status === 'out_of_stock') {
    return 'Rupture'
  }

  if (status === 'low_stock') {
    return 'Stock faible'
  }

  return 'En stock'
}

function activeLabel(active?: boolean | null) {
  return active === false ? 'Inactif' : 'Actif'
}

function productURL(product: ProductDoc) {
  return product.slug ? `/fr/produits/${product.slug}` : null
}

function filterOptions(result: unknown) {
  if (!result || typeof result !== 'object' || !('docs' in result) || !Array.isArray(result.docs)) {
    return [] as FilterOption[]
  }

  return result.docs.flatMap((doc): FilterOption[] => {
    if (!doc || typeof doc !== 'object' || !('id' in doc)) {
      return []
    }

    const id = doc.id

    if (typeof id !== 'number' && typeof id !== 'string') {
      return []
    }

    return [{ id, name: 'name' in doc && typeof doc.name === 'string' ? doc.name : null }]
  })
}

function sortIndicator(sort: string, field: string) {
  const direction = sortDirection(sort, field)

  if (!direction) {
    return null
  }

  return (
    <span aria-hidden="true" className="amous-sort-indicator">
      {direction === 'ascending' ? '\u2191' : '\u2193'}
    </span>
  )
}

export async function AdminProductsListView(props: ListViewServerProps) {
  const products = (props.data?.docs || []) as ProductDoc[]
  const totalDocs = Number(props.data?.totalDocs || 0)
  const currentPage = Number(props.data?.page || 1)
  const totalPages = Number(props.data?.totalPages || 1)
  const limit = Number(props.limit || 20)
  const searchValue =
    queryValue(props.searchParams, 'where[or][0][name][like]') ||
    queryValue(props.searchParams, 'where[or][1][sku][like]') ||
    queryValue(props.searchParams, 'where[or][2][manufacturerReference][like]')
  const stockValue = queryValue(props.searchParams, 'where[stockStatus][equals]')
  const statusValue = queryValue(props.searchParams, 'where[active][equals]')
  const categoryValue = queryValue(props.searchParams, 'where[category][equals]')
  const brandValue = queryValue(props.searchParams, 'where[brand][equals]')
  const sortValue = queryValue(props.searchParams, 'sort')
  const displayValues = queryValues(props.searchParams, 'display')
  const hasColumnPreferences = displayValues.length > 0
  const showCategory = !hasColumnPreferences || displayValues.includes('category')
  const showBrand = hasColumnPreferences && displayValues.includes('brand')
  const basePath = '/admin/collections/products'
  const hasFilters = Boolean(searchValue || stockValue || statusValue || categoryValue || brandValue)
  const [categoriesResult, brandsResult, totalProductsResult] = await Promise.all([
    props.payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'name',
      user: props.user
    }),
    props.payload.find({
      collection: 'brands',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'name',
      user: props.user
    }),
    hasFilters
      ? props.payload.count({
          collection: 'products',
          overrideAccess: false,
          user: props.user
        })
      : Promise.resolve({ totalDocs })
  ])
  const categories = filterOptions(categoriesResult)
  const brands = filterOptions(brandsResult)
  const totalProducts = Number(totalProductsResult.totalDocs || totalDocs)
  const resultCount = hasFilters ? `${totalDocs} produits sur ${totalProducts}` : `${totalDocs} produits`

  return (
    <main className="amous-list-page amous-products-page">
      <AdminPageHeader
        action={
          props.hasCreatePermission ? (
            <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
              <Plus aria-hidden="true" size={16} />
              Ajouter un produit
            </Link>
          ) : null
        }
        description="Gérez le catalogue, les prix et les niveaux de stock."
        title="Produits"
      />

      <AdminListToolbar
        filters={
          hasFilters ? (
            <div aria-label="Filtres actifs" aria-live="polite" className="amous-active-filters">
              {searchValue ? (
                <Link
                  aria-label="Retirer la recherche"
                  className="amous-filter-chip"
                  href={buildFilterHref({ basePath, omit: SEARCH_QUERY_KEYS, searchParams: props.searchParams })}
                >
                  Recherche: {searchValue}
                  <X aria-hidden="true" size={14} />
                </Link>
              ) : null}
              {stockValue ? (
                <Link
                  aria-label="Retirer le filtre de stock"
                  className="amous-filter-chip"
                  href={buildFilterHref({ basePath, omit: ['where[stockStatus][equals]'], searchParams: props.searchParams })}
                >
                  Stock: {stockLabel(stockValue)}
                  <X aria-hidden="true" size={14} />
                </Link>
              ) : null}
              {statusValue ? (
                <Link
                  aria-label="Retirer le filtre de statut"
                  className="amous-filter-chip"
                  href={buildFilterHref({ basePath, omit: ['where[active][equals]'], searchParams: props.searchParams })}
                >
                  Statut: {statusValue === 'false' ? 'Inactif' : 'Actif'}
                  <X aria-hidden="true" size={14} />
                </Link>
              ) : null}
              {categoryValue ? (
                <Link
                  aria-label="Retirer le filtre de categorie"
                  className="amous-filter-chip"
                  href={buildFilterHref({ basePath, omit: ['where[category][equals]'], searchParams: props.searchParams })}
                >
                  Cat&eacute;gorie: {categories.find((category) => String(category.id) === categoryValue)?.name || '\u2014'}
                  <X aria-hidden="true" size={14} />
                </Link>
              ) : null}
              {brandValue ? (
                <Link
                  aria-label="Retirer le filtre de marque"
                  className="amous-filter-chip"
                  href={buildFilterHref({ basePath, omit: ['where[brand][equals]'], searchParams: props.searchParams })}
                >
                  Marque: {brands.find((brand) => String(brand.id) === brandValue)?.name || '\u2014'}
                  <X aria-hidden="true" size={14} />
                </Link>
              ) : null}
              <Link className="amous-active-filters__clear" href={basePath}>
                Réinitialiser
              </Link>
            </div>
          ) : null
        }
      >
        <AdminAutoSubmitForm action={basePath}>
          <label className="amous-search-input">
            <Search aria-hidden="true" size={16} />
            <input defaultValue={searchValue} name="where[or][0][name][like]" placeholder="Rechercher un produit, SKU..." type="search" />
          </label>
          <input name="where[or][1][sku][like]" type="hidden" value={searchValue} />
          <input name="where[or][2][manufacturerReference][like]" type="hidden" value={searchValue} />
          <details className="amous-more-filters">
            <summary>
              <SlidersHorizontal aria-hidden="true" size={16} />
              Filtres
            </summary>
            <div className="amous-more-filters__menu">
              <label>
                <span>Stock</span>
                <select aria-label="Filtrer par stock" defaultValue={stockValue} name="where[stockStatus][equals]">
                  <option value="">Tous</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock faible</option>
                  <option value="out_of_stock">Rupture</option>
                </select>
              </label>
              <label>
                <span>Statut</span>
                <select aria-label="Filtrer par statut" defaultValue={statusValue} name="where[active][equals]">
                  <option value="">Tous</option>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </label>
              <label>
                <span>Catégorie</span>
                <select aria-label="Filtrer par catégorie" defaultValue={categoryValue} name="where[category][equals]">
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name || '\u2014'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Marque</span>
                <select aria-label="Filtrer par marque" defaultValue={brandValue} name="where[brand][equals]">
                  <option value="">Toutes les marques</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={String(brand.id)}>
                      {brand.name || '\u2014'}
                    </option>
                  ))}
                </select>
              </label>
              <div className="amous-more-filters__price-grid">
                <label>
                  <span>Prix min.</span>
                  <input aria-label="Prix minimum" disabled placeholder="Bientôt" type="text" />
                </label>
                <label>
                  <span>Prix max.</span>
                  <input aria-label="Prix maximum" disabled placeholder="Bientôt" type="text" />
                </label>
              </div>
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
          <div className="amous-filter-form__utilities">
            <select aria-label="Trier les produits" defaultValue={sortValue} name="sort">
              <option value="">Trier</option>
              <option value="name">Nom: A - Z</option>
              <option value="-name">Nom: Z - A</option>
              <option value="publicPrice">Prix: croissant</option>
              <option value="-publicPrice">Prix: d&eacute;croissant</option>
              <option value="stockQuantity">Stock: croissant</option>
              <option value="-stockQuantity">Stock: d&eacute;croissant</option>
              <option value="-updatedAt">Modifiés récemment</option>
            </select>
            <details className="amous-column-picker">
              <summary>
                <Columns3 aria-hidden="true" size={16} />
                Colonnes
              </summary>
              <div className="amous-column-picker__menu">
                <input name="display" type="hidden" value="none" />
                <label>
                  <input defaultChecked={showCategory} name="display" type="checkbox" value="category" />
                  <span>Catégorie</span>
                </label>
                <label>
                  <input defaultChecked={showBrand} name="display" type="checkbox" value="brand" />
                  <span>Marque</span>
                </label>
              </div>
            </details>
          </div>
        </AdminAutoSubmitForm>
      </AdminListToolbar>

      {products.length ? (
        <section aria-label="Liste des produits" className="amous-table-shell amous-products-table-shell">
          <div className="amous-products-table__summary" role="status">
            {resultCount}
          </div>
          <AdminProductSelectionShell>
          <div className="amous-table-wrap">
            <table className="amous-table amous-products-table">
              <colgroup>
                <col className="amous-products-table__select-column" />
                <col className="amous-products-table__product-column" />
                <col className="amous-products-table__sku-column" />
                {showCategory ? <col className="amous-products-table__category-column" /> : null}
                {showBrand ? <col className="amous-products-table__brand-column" /> : null}
                <col className="amous-products-table__price-column" />
                <col className="amous-products-table__stock-column" />
                <col className="amous-products-table__status-column" />
                <col className="amous-products-table__actions-column" />
              </colgroup>
              <thead>
                <tr>
                  <th className="amous-products-table__select-column">
                    <input aria-label="Sélectionner tous les produits" name="productSelectionAll" type="checkbox" />
                  </th>
                  <th aria-sort={sortDirection(sortValue, 'name')}>Produit {sortIndicator(sortValue, 'name')}</th>
                  <th className="amous-products-table__sku-column">SKU</th>
                  {showCategory ? <th className="amous-products-table__category-column">Catégorie</th> : null}
                  {showBrand ? <th className="amous-products-table__brand-column">Marque</th> : null}
                  <th aria-sort={sortDirection(sortValue, 'publicPrice')} className="is-right">Prix {sortIndicator(sortValue, 'publicPrice')}</th>
                  <th aria-sort={sortDirection(sortValue, 'stockQuantity')} className="is-right">Stock {sortIndicator(sortValue, 'stockQuantity')}</th>
                  <th>Statut</th>
                  <th aria-label="Actions" className="is-right" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const id = String(product.id)
                  const availableStock =
                    typeof product.availableStock === 'number'
                      ? product.availableStock
                      : getAvailableStock({
                          reservedStock: typeof product.reservedStock === 'number' ? product.reservedStock : 0,
                          stockQuantity: typeof product.stockQuantity === 'number' ? product.stockQuantity : 0
                        })
                  const brandLabel = relatedLabel(product.brand, brands)
                  const categoryLabel = relatedLabel(product.category, categories)
                  const storeURL = productURL(product)

                  return (
                    <tr key={id}>
                      <td className="amous-products-table__select-column">
                        <input aria-label={`Sélectionner ${stringValue(product.name) || 'ce produit'}`} name="productSelection" type="checkbox" value={id} />
                      </td>
                      <td className="amous-products-table__product" data-label="Produit">
                        <ProductCell
                          href={`${basePath}/${id}`}
                          imageAlt={stringValue(product.name)}
                          imageURL={imageURL(product)}
                          meta={brandLabel !== '\u2014' ? brandLabel : stringValue(product.sku)}
                          name={stringValue(product.name) || 'Produit'}
                        />
                      </td>
                      <td className="amous-products-table__sku-column" data-label="SKU">
                        <span className={stringValue(product.sku) ? 'amous-sku' : 'amous-empty-value'}>{stringValue(product.sku) || '\u2014'}</span>
                      </td>
                      {showCategory ? (
                        <td className="amous-products-table__category-column" data-label="Categorie">
                          <span className={categoryLabel === '\u2014' ? 'amous-empty-value' : undefined}>
                            {categoryLabel}
                          </span>
                        </td>
                      ) : null}
                      {showBrand ? (
                        <td className="amous-products-table__brand-column" data-label="Marque">
                          <span className={brandLabel === '\u2014' ? 'amous-empty-value' : undefined}>
                            {brandLabel}
                          </span>
                        </td>
                      ) : null}
                      <td className="amous-products-table__price is-right" data-label="Prix">
                        <Money amount={typeof product.publicPrice === 'number' ? product.publicPrice : 0} className="amous-price" />
                      </td>
                      <td className="amous-products-table__stock is-right" data-label="Stock">
                        <span className={`amous-stock-value amous-stock-value--${product.stockStatus || 'in_stock'}`}>
                          {availableStock}
                        </span>
                        <span className={`amous-stock-note amous-stock-note--${product.stockStatus || 'in_stock'}`}>
                          {stockLabel(product.stockStatus)}
                        </span>
                      </td>
                      <td className="amous-products-table__status" data-label="Statut">
                        <StatusBadge variant={product.active === false ? 'neutral' : 'success'}>{activeLabel(product.active)}</StatusBadge>
                      </td>
                      <td className="amous-products-table__actions is-right" data-label="Actions">
                        <details className="amous-row-actions">
                          <summary aria-label={`Actions pour ${stringValue(product.name) || 'ce produit'}`}>
                            <EllipsisVertical aria-hidden="true" size={16} />
                          </summary>
                          <div className="amous-row-actions__menu">
                            <Link href={`${basePath}/${id}`}>Modifier</Link>
                            {storeURL ? <Link href={storeURL}>Voir le produit</Link> : null}
                            <button disabled type="button">Dupliquer</button>
                            <button disabled type="button">Modifier le stock</button>
                            <button disabled type="button">{product.active === false ? 'Activer' : 'Désactiver'}</button>
                            <button className="is-danger" disabled type="button">Supprimer</button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </AdminProductSelectionShell>
          <AdminPagination
            basePath={basePath}
            currentPage={currentPage}
            limit={limit}
            query={compactQuery(props.searchParams)}
            totalDocs={totalDocs}
            totalPages={totalPages}
          />
        </section>
      ) : (
        <AdminEmptyState
          action={
            props.hasCreatePermission ? (
              <Link className="amous-admin-button amous-admin-button--primary" href={props.newDocumentURL}>
                <Plus aria-hidden="true" size={16} />
                Ajouter un produit
              </Link>
            ) : null
          }
          icon={<Package aria-hidden="true" size={20} />}
          description={
            hasFilters
              ? 'Essayez de modifier votre recherche ou vos filtres.'
              : 'Ajoutez votre premier produit pour commencer a construire votre catalogue.'
          }
          title={hasFilters ? 'Aucun produit trouvé' : 'Aucun produit'}
        />
      )}
    </main>
  )
}

