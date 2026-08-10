export default function CategoriesLoading() {
  return (
    <main className="bg-[var(--color-background)] py-8 sm:py-10">
      <div className="container-page">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-1 w-12 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-16 max-w-3xl animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4" key={index}>
              <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-sm)] bg-slate-100" />
              <div className="mt-4 h-1 w-10 animate-pulse rounded bg-slate-200" />
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
