'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ReturnActionType = 'approve' | 'complete' | 'receive' | 'reject'

type Props = {
  actions: ReturnActionType[]
  returnId: number | string
}

const LABELS: Record<ReturnActionType, string> = {
  approve: 'Approuver',
  complete: 'Cloturer',
  receive: 'Marquer recu',
  reject: 'Refuser'
}

export function AdminReturnWorkflowActions({ actions, returnId }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (actions.length === 0) {
    return <p className="amous-empty-value">Aucune action disponible pour ce statut.</p>
  }

  const run = async (action: ReturnActionType) => {
    setPending(action)
    setError(null)
    try {
      const response = await fetch(`/api/admin/returns/${returnId}/actions`, {
        body: JSON.stringify({ action }),
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

  return (
    <div className="amous-order-workflow-actions">
      {error ? <p className="amous-form-error" role="alert">{error}</p> : null}
      <div className="amous-order-workflow-actions__buttons">
        {actions.map((action) => (
          <button
            className={`amous-admin-button ${action === 'reject' ? 'amous-admin-button--secondary' : 'amous-admin-button--primary'}`}
            disabled={pending !== null}
            key={action}
            onClick={() => run(action)}
            type="button"
          >
            {pending === action ? 'En cours...' : LABELS[action]}
          </button>
        ))}
      </div>
    </div>
  )
}
