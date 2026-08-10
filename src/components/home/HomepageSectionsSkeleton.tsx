import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

function SectionHeaderSkeleton() {
  return (
    <div className="mb-5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </div>
  )
}

export function HomepageSectionsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-10 px-4 py-10 sm:px-6 md:space-y-16 lg:px-8">
      <section>
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="rounded-md border border-[var(--color-border)] bg-white p-3" key={index}>
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-3 h-5 w-28" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeaderSkeleton />
        <ProductGridSkeleton />
      </section>

      <section>
        <SectionHeaderSkeleton />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4" key={index}>
              <Skeleton className="aspect-[16/7] w-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div className="rounded-md border border-[var(--color-border)] bg-white p-4" key={index}>
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeaderSkeleton />
        <ProductGridSkeleton />
      </section>
    </div>
  )
}
