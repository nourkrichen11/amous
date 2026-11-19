import { PRODUCT_GRID_CLASS } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Chargement des produits" className="@container" role="status">
      <div className={PRODUCT_GRID_CLASS}>
        {Array.from({ length: count }).map((_, index) => (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-3" key={index}>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-3 h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-3/4" />
            <Skeleton className="mt-4 h-6 w-24" />
            <Skeleton className="mt-3 h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
