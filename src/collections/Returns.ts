import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Returns: CollectionConfig = {
  slug: 'returns',
  admin: {
    defaultColumns: ['returnNumber', 'order', 'status', 'refundStatus', 'createdAt'],
    group: 'Ventes',
    useAsTitle: 'returnNumber'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
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
      index: true
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
        { name: 'restoreToStock', type: 'checkbox', defaultValue: false }
      ]
    },
    { name: 'reason', type: 'textarea', required: true },
    { name: 'internalNote', type: 'textarea' }
  ]
}
