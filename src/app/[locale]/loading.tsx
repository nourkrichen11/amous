import { HomepageSectionsSkeleton } from '@/components/home/HomepageSectionsSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <main id="main-content">
      <section className="overflow-x-clip">
        <Skeleton className="h-[220px] w-full sm:h-auto sm:aspect-[16/5]" />
      </section>
      <HomepageSectionsSkeleton />
    </main>
  )
}
