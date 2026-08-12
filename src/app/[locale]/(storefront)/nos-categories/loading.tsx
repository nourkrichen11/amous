export default function CategoriesLoading() {
  return (
    <main className="bg-[var(--color-background)] py-5 sm:py-6 lg:pb-8 lg:pt-12">
      <div className="container-catalog">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 lg:hidden" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded bg-slate-200 lg:mt-0 lg:h-[52px]" />
        <div className="mt-3 h-14 max-w-[920px] animate-pulse rounded bg-slate-200" />
        <div className="categories-grid mt-6 lg:mt-10">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="min-h-[310px] rounded-xl border border-[var(--color-border)] bg-white p-5" key={index}>
              <div className="h-[148px] animate-pulse rounded-[var(--radius-md)] bg-slate-100" />
              <div className="mt-4 h-1 w-11 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
