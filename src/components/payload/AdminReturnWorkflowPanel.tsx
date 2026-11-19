import type { ServerComponentProps } from 'payload'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { getReturnStatusLabel } from '@/features/returns/status'

import { AdminReturnWorkflowActions } from './AdminReturnWorkflowActions'

type ReturnActionType = 'approve' | 'complete' | 'receive' | 'reject'

const ACTIONS_BY_STATUS: Record<string, ReturnActionType[]> = {
  approved: ['receive', 'reject'],
  completed: [],
  received: ['complete'],
  rejected: [],
  requested: ['approve', 'reject']
}

export async function AdminReturnWorkflowPanel({ data, id }: ServerComponentProps) {
  if (!id) {
    return null
  }

  const status = typeof data?.status === 'string' ? data.status : 'requested'
  const availableActions = ACTIONS_BY_STATUS[status] ?? []

  return (
    <div className="amous-order-workflow-panel">
      <div className="amous-order-workflow-panel__badges">
        <StatusBadge variant="info">{getReturnStatusLabel(status)}</StatusBadge>
      </div>
      <AdminReturnWorkflowActions actions={availableActions} returnId={id} />
    </div>
  )
}
