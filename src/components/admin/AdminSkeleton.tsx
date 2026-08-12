export function SkeletonMetric() {
  return <div className="amous-skeleton amous-skeleton--metric" />
}

export function SkeletonSection() {
  return <div className="amous-skeleton amous-skeleton--section" />
}

export function SkeletonTable() {
  return (
    <div className="amous-table-shell">
      <div className="amous-table">
        <div className="amous-table__skeleton-row">
          <div className="amous-skeleton amous-skeleton--cell amous-skeleton--wide" />
          <div className="amous-skeleton amous-skeleton--cell" />
          <div className="amous-skeleton amous-skeleton--cell" />
          <div className="amous-skeleton amous-skeleton--cell amous-skeleton--short" />
        </div>
        <div className="amous-table__skeleton-body">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="amous-table__skeleton-row" key={index}>
              <div className="amous-skeleton amous-skeleton--cell amous-skeleton--wide" />
              <div className="amous-skeleton amous-skeleton--cell" />
              <div className="amous-skeleton amous-skeleton--cell" />
              <div className="amous-skeleton amous-skeleton--cell amous-skeleton--short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
