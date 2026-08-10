import { Skeleton } from '@/components/ui/Skeleton'

export default function CheckoutLoading() {
  return (
    <main className="container-page py-8">
      <Skeleton className="h-8 w-64" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </main>
  )
}
