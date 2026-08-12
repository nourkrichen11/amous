import { Skeleton } from '@/components/ui/Skeleton'

export default function CartLoading() {
  return (
    <main className="container-page py-8">
      <Skeleton className="h-8 w-48" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  )
}
