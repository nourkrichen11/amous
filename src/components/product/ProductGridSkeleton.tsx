import { Skeleton } from '@/components/ui/Skeleton'

export function ProductGridSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-3" key={index}>
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-3 h-4 w-20" />
          <Skeleton className="mt-3 h-5 w-full" />
          <Skeleton className="mt-2 h-4 w-24" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
