import { formatMoney } from '@/lib/money'

type MoneyProps = {
  amount: number
  className?: string
}

export function Money({ amount, className }: MoneyProps) {
  return <span className={className}>{formatMoney(amount)}</span>
}
