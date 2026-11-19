import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'

export default function ShopLoading() {
  return (
    <main className="bg-[var(--color-background)] py-7 sm:py-8 lg:py-10">
      <div className="container-catalog">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => <div className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-slate-200" key={index} />)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden h-[620px] animate-pulse rounded-lg bg-slate-200 lg:block" />
          <div>
            <div className="mb-5 h-16 animate-pulse rounded-lg bg-slate-200" />
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </main>
  )
}
