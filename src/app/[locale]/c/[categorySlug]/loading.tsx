import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'

export default function CategoryLoading() {
  return (
    <main className="container-page py-8">
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <div className="h-96 animate-pulse rounded-md bg-slate-200" />
        <ProductGridSkeleton />
      </div>
    </main>
  )
}
