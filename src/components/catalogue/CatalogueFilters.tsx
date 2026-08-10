import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import type { BrandItem, CategoryItem } from '@/features/catalogue/types'

type CatalogueFiltersProps = {
  brands: BrandItem[]
  categories?: CategoryItem[]
  locale: Locale
  params: Record<string, string | undefined>
  path: string
}

export function CatalogueFilters({ brands, categories = [], locale, params, path }: CatalogueFiltersProps) {
  return (
    <form action={path} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="font-semibold">{t(locale, 'catalogue.filters')}</h2>
      {categories.length > 0 ? (
        <label className="mt-4 grid gap-1 text-sm">
          {t(locale, 'catalogue.category')}
          <select className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" name="category">
            <option value="">-</option>
            {categories.map((category) => (
              <option key={String(category.id)} selected={params.category === category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="mt-4 grid gap-1 text-sm">
        {t(locale, 'catalogue.brand')}
        <select className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" name="brand">
          <option value="">-</option>
          {brands.map((brand) => (
            <option key={String(brand.id)} selected={params.brand === brand.slug} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 grid gap-1 text-sm">
        {t(locale, 'catalogue.minPrice')}
        <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={params.minPrice} min="0" name="minPrice" type="number" />
      </label>
      <label className="mt-4 grid gap-1 text-sm">
        {t(locale, 'catalogue.maxPrice')}
        <input className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" defaultValue={params.maxPrice} min="0" name="maxPrice" type="number" />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input defaultChecked={params.inStock === '1'} name="inStock" type="checkbox" value="1" />
        {t(locale, 'catalogue.inStockOnly')}
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input defaultChecked={params.promotion === '1'} name="promotion" type="checkbox" value="1" />
        {t(locale, 'catalogue.promotionOnly')}
      </label>
      <label className="mt-4 grid gap-1 text-sm">
        {t(locale, 'catalogue.sort')}
        <select className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3" name="sort">
          <option selected={!params.sort || params.sort === 'name'} value="name">
            A-Z
          </option>
          <option selected={params.sort === 'price-asc'} value="price-asc">
            Prix ↑
          </option>
          <option selected={params.sort === 'price-desc'} value="price-desc">
            Prix ↓
          </option>
          <option selected={params.sort === 'new'} value="new">
            Nouveautés
          </option>
        </select>
      </label>
      <div className="mt-5 grid gap-2">
        <button className="min-h-[var(--touch-target)] rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white" type="submit">
          {t(locale, 'catalogue.apply')}
        </button>
        <a className="inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md border border-[var(--color-border)] px-4 font-semibold" href={path}>
          {t(locale, 'catalogue.reset')}
        </a>
      </div>
    </form>
  )
}
