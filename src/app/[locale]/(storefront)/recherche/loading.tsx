import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'

export default function SearchLoading() {
  return (
    <main className="container-page py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-12 max-w-2xl animate-pulse rounded bg-slate-200" />
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </main>
  )
}
