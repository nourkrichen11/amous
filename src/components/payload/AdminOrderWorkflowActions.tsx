'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { AvailableAction } from '@/features/orders/workflow'

type Props = {
  actions: AvailableAction[]
  orderId: number | string
}

const LABELS: Record<string, string> = {
  cancel: 'Annuler la commande',
  confirm: 'Confirmer',
  fulfill_delivered: 'Marquer livree',
  fulfill_ready_to_ship: 'Prete a expedier',
  fulfill_shipped: 'Expedier',
  mark_paid: 'Marquer payee',
  reject: 'Rejeter',
  start_fulfillment: 'Demarrer la preparation'
}

function actionKey(action: AvailableAction) {
  return action.type === 'fulfill' ? `fulfill_${action.stage}` : action.type
}

function isDanger(action: AvailableAction) {
  return action.type === 'cancel' || action.type === 'reject'
}

export function AdminOrderWorkflowActions({ actions, orderId }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundFull, setRefundFull] = useState(false)

  const run = async (body: Record<string, unknown>, key: string) => {
    setPending(key)
    setError(null)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/actions`, {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.message || json.code || 'Une erreur est survenue.')
        return
      }
      router.refresh()
    } catch {
      setError('Une erreur reseau est survenue.')
    } finally {
      setPending(null)
    }
  }

  const simpleActions = actions.filter((action) => action.type !== 'refund' && action.type !== 'return')
  const canRefund = actions.some((action) => action.type === 'refund')

  if (simpleActions.length === 0 && !canRefund) {
    return <p className="amous-empty-value">Aucune action disponible pour ce statut.</p>
  }

  return (
    <div className="amous-order-workflow-actions">
      {error ? <p className="amous-form-error" role="alert">{error}</p> : null}
      <div className="amous-order-workflow-actions__buttons">
        {simpleActions.map((action) => {
          const key = actionKey(action)
          const body = action.type === 'fulfill' ? { action: 'fulfill', stage: action.stage } : { action: action.type }

          return (
            <button
              className={`amous-admin-button ${isDanger(action) ? 'amous-admin-button--secondary' : 'amous-admin-button--primary'}`}
              disabled={pending !== null}
              key={key}
              onClick={() => run(body, key)}
              type="button"
            >
              {pending === key ? 'En cours...' : LABELS[key] ?? key}
            </button>
          )
        })}
      </div>
      {canRefund ? (
        <div className="amous-order-workflow-actions__refund">
          <label>
            <span>Montant a rembourser (DT)</span>
            <input
              inputMode="decimal"
              onChange={(event) => setRefundAmount(event.target.value)}
              placeholder="0.000"
              type="text"
              value={refundAmount}
            />
          </label>
          <label className="amous-order-workflow-actions__refund-full">
            <input checked={refundFull} onChange={(event) => setRefundFull(event.target.checked)} type="checkbox" />
            <span>Remboursement total</span>
          </label>
          <button
            className="amous-admin-button amous-admin-button--secondary"
            disabled={pending !== null || !refundAmount}
            onClick={() => {
              const dinars = Number.parseFloat(refundAmount.replace(',', '.'))
              if (!Number.isFinite(dinars) || dinars <= 0) {
                setError('Montant de remboursement invalide.')
                return
              }
              run({ action: 'refund', amount: Math.round(dinars * 1000), full: refundFull }, 'refund')
            }}
            type="button"
          >
            {pending === 'refund' ? 'En cours...' : 'Rembourser'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
