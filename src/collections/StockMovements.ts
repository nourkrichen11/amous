import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const stockMovementTypeOptions = [
  { label: 'Ajustement manuel', value: 'manual_adjustment' },
  { label: 'Reservation commande', value: 'order_reservation' },
  { label: 'Liberation reservation', value: 'reservation_release' },
  { label: 'Expedition commande', value: 'order_fulfillment' },
  { label: 'Retour', value: 'return' },
  { label: 'Reapprovisionnement', value: 'restock' },
  { label: 'Correction', value: 'correction' }
] as const

export const StockMovements: CollectionConfig = {
  slug: 'stock-movements',
  admin: {
    defaultColumns: ['product', 'type', 'quantityDelta', 'previousQuantity', 'resultingQuantity', 'createdAt'],
    group: 'Catalogue',
    useAsTitle: 'reason'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    {
      name: 'type',
      type: 'select',
      options: [...stockMovementTypeOptions],
      required: true,
      index: true
    },
    { name: 'quantityDelta', type: 'number', required: true },
    { name: 'previousQuantity', type: 'number', required: true },
    { name: 'resultingQuantity', type: 'number', required: true },
    { name: 'previousReservedStock', type: 'number', defaultValue: 0, required: true },
    { name: 'resultingReservedStock', type: 'number', defaultValue: 0, required: true },
    { name: 'order', type: 'relationship', relationTo: 'orders', index: true },
    { name: 'reason', type: 'text', required: true },
    { name: 'note', type: 'textarea' },
    { name: 'admin', type: 'relationship', relationTo: 'users' },
    {
      name: 'metadata',
      type: 'json'
    }
  ]
}
