import { Skeleton } from '@/components/ui/Skeleton'

export default function ProductLoading() {
  return (
    <main className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="rounded-md border border-[var(--color-border)] bg-white p-5">
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="mt-4 h-4 w-32" />
          <Skeleton className="mt-8 h-10 w-40" />
          <Skeleton className="mt-6 h-12 w-full" />
        </div>
      </div>
    </main>
  )
}
