import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

export default function CategoryLoading() {
  return (
    <main className="bg-[var(--color-background)] pb-4">
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="container-catalog py-4 sm:py-5">
          <Skeleton className="h-4 w-56" />
          <div className="mt-3 flex items-center gap-4">
            <Skeleton className="hidden h-16 w-16 sm:block" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-full max-w-xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-catalog mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Skeleton className="hidden h-[520px] rounded-[var(--radius-lg)] lg:block" />
        <div className="min-w-0">
          <Skeleton className="h-11 w-full" />
          <div className="mb-4 mt-3 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-64" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  )
}
