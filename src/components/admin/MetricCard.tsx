type MetricCardProps = {
  label: string
  value: React.ReactNode
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="amous-card amous-metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}
