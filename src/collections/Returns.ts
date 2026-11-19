import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const RETURN_WORKFLOW_FIELDS = ['status'] as const

/**
 * Mirrors the `guardWorkflowFieldWrites` hook on `Orders` — `status` is only
 * ever legally written by `applyReturnAction` (src/features/returns/workflow.ts),
 * which restocks inventory exactly once on the `received` transition. Direct
 * edits through the generic admin form would bypass that restocking logic
 * entirely. `refundStatus` has no inventory side effect and no dedicated
 * workflow action, so it deliberately stays freely editable, same as today.
 */
const guardReturnWorkflowFieldWrites: CollectionBeforeChangeHook = ({ context, data, operation, originalDoc }) => {
  if (operation !== 'update' || context.fromWorkflowService) {
    return data
  }

  const changedField = RETURN_WORKFLOW_FIELDS.find((field) => field in data && data[field] !== originalDoc?.[field])

  if (changedField) {
    throw new APIError(`Le champ "${changedField}" est gere exclusivement par les actions du workflow de retour.`, 400)
  }

  return data
}

export const Returns: CollectionConfig = {
  slug: 'returns',
  admin: {
    components: {
      views: {
        list: {
          Component: '@/components/payload/AdminReturnsListView#AdminReturnsListView'
        }
      }
    },
    defaultColumns: ['returnNumber', 'order', 'status', 'refundStatus', 'createdAt'],
    group: 'Ventes',
    useAsTitle: 'returnNumber'
  },
  labels: {
    plural: 'Retours',
    singular: 'Retour'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  hooks: {
    beforeChange: [guardReturnWorkflowFieldWrites]
  },
  fields: [
    {
      name: 'returnWorkflowPanel',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/payload/AdminReturnWorkflowPanel#AdminReturnWorkflowPanel'
        }
      }
    },
    { name: 'returnNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'requested',
      options: [
        { label: 'Demandee', value: 'requested' },
        { label: 'Approuvee', value: 'approved' },
        { label: 'Refusee', value: 'rejected' },
        { label: 'Recue', value: 'received' },
        { label: 'Terminee', value: 'completed' }
      ],
      required: true,
      index: true,
      admin: {
        readOnly: true
      }
    },
    {
      name: 'refundStatus',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Aucun', value: 'none' },
        { label: 'En attente', value: 'pending' },
        { label: 'Rembourse', value: 'refunded' }
      ],
      required: true
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'productSku', type: 'text', required: true },
        { name: 'productName', type: 'text', required: true },
        { name: 'quantity', type: 'number', min: 1, required: true },
        { name: 'restoreToStock', type: 'checkbox', defaultValue: false },
        {
          name: 'restocked',
          type: 'checkbox',
          defaultValue: false,
          label: 'Stock restaure',
          admin: {
            description: 'Coche automatiquement par le workflow de retour une fois le stock physique restaure. Ne pas modifier manuellement.',
            readOnly: true
          }
        }
      ]
    },
    { name: 'reason', type: 'textarea', required: true },
    { name: 'internalNote', type: 'textarea' }
  ]
}
