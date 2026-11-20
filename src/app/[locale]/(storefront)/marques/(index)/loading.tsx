import { Skeleton } from '@/components/ui/Skeleton'

export default function BrandsLoading() {
  return (
    <main className="bg-[var(--color-background)] py-5 sm:py-6 lg:pb-8 lg:pt-10">
      <div className="container-catalog">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-10 w-64" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
        <div aria-busy="true" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" role="status">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton className="h-[164px] rounded-[var(--radius-lg)]" key={index} />
          ))}
        </div>
      </div>
    </main>
  )
}
