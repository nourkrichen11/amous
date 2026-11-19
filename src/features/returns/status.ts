export const returnStatusOptions = [
  { label: 'Demandée', value: 'requested' },
  { label: 'Approuvée', value: 'approved' },
  { label: 'Refusée', value: 'rejected' },
  { label: 'Reçue', value: 'received' },
  { label: 'Terminée', value: 'completed' }
] as const

export const refundStatusOptions = [
  { label: 'Aucun', value: 'none' },
  { label: 'En attente', value: 'pending' },
  { label: 'Remboursé', value: 'refunded' }
] as const

function labelFor(options: readonly { label: string; value: string }[], value?: string) {
  return options.find((option) => option.value === value)?.label ?? value ?? ''
}

export function getReturnStatusLabel(status?: string) {
  return labelFor(returnStatusOptions, status)
}

export function getRefundStatusLabel(status?: string) {
  return labelFor(refundStatusOptions, status)
}
