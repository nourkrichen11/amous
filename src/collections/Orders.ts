import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin, isAdminOrOwnOrder } from '@/access/isAdmin'
import { confirmationStatusOptions, fulfillmentStatusOptions, orderStatusOptions, paymentMethodOptions, paymentStatusOptions } from '@/features/orders/status'
import { createAuditLog } from '@/lib/audit'
import { normalizePhone } from '@/lib/phone'

const normalizeOrderContact: CollectionBeforeChangeHook = ({ data }) => {
  if (typeof data.customerPhone === 'string') {
    data.customerPhoneNormalized = normalizePhone(data.customerPhone)
  }

  return data
}

const auditOrderChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  await createAuditLog(req.payload, {
    adminId: req.user?.id,
    entityId: doc.id,
    entityReference: doc.orderNumber || String(doc.id),
    entityType: 'order',
    event: operation === 'create' ? 'order_created' : 'order_changed',
    req,
    summary: operation === 'create' ? 'Commande creee' : 'Commande modifiee'
  })

  return doc
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    defaultColumns: ['orderNumber', 'orderStatus', 'confirmationStatus', 'paymentStatus', 'fulfillmentStatus', 'customerEmail', 'total', 'createdAt'],
    group: 'Ventes',
    useAsTitle: 'orderNumber'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrOwnOrder,
    update: isAdmin
  },
  hooks: {
    afterChange: [auditOrderChange],
    beforeChange: [normalizeOrderContact]
  },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true, label: 'Numero de commande' },
    { name: 'confirmationToken', type: 'text', required: true, index: true },
    { name: 'idempotencyKey', type: 'text', required: true, unique: true, index: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      index: true
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'received',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Ready for pickup', value: 'ready_for_pickup' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ],
      required: true
    },
    {
      name: 'orderStatus',
      type: 'select',
      defaultValue: 'new',
      options: [...orderStatusOptions],
      required: true,
      index: true,
      label: 'Statut de la commande',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'confirmationStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [...confirmationStatusOptions],
      required: true,
      index: true,
      label: 'Confirmation',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        ...paymentStatusOptions,
        { label: 'Ancien statut COD a regulariser', value: 'cash_on_delivery' },
        { label: 'Echec', value: 'failed' }
      ],
      index: true,
      required: true,
      label: 'Paiement',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'cash_on_delivery',
      options: [...paymentMethodOptions],
      index: true,
      required: true,
      label: 'Mode de paiement',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      defaultValue: 'unfulfilled',
      options: [...fulfillmentStatusOptions],
      required: true,
      index: true,
      label: 'Preparation et livraison',
      admin: {
        position: 'sidebar'
      }
    },
    { name: 'customerFirstName', type: 'text', required: true, index: true },
    { name: 'customerLastName', type: 'text', required: true, index: true },
    { name: 'customerEmail', type: 'email', required: true, index: true },
    { name: 'customerPhone', type: 'text', required: true, index: true },
    { name: 'customerPhoneNormalized', type: 'text', index: true },
    {
      name: 'deliveryMethod',
      type: 'select',
      defaultValue: 'home_delivery',
      options: [
        { label: 'Home delivery', value: 'home_delivery' },
        { label: 'Store pickup', value: 'store_pickup' }
      ],
      required: true
    },
    {
      name: 'deliveryAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'governorate', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'instructions', type: 'textarea' }
      ]
    },
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'governorate', type: 'text' },
        { name: 'postalCode', type: 'text' }
      ]
    },
    { name: 'storeName', type: 'text' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'productSku', type: 'text', required: true },
        { name: 'productName', type: 'text', required: true },
        { name: 'unit', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'vatRate', type: 'number', required: true },
        { name: 'lineSubtotal', type: 'number', required: true },
        { name: 'lineVatTotal', type: 'number', required: true },
        { name: 'lineTotal', type: 'number', required: true }
      ]
    },
    { name: 'subtotal', type: 'number', required: true, label: 'Sous-total', admin: { position: 'sidebar' } },
    { name: 'vatTotal', type: 'number', required: true, label: 'TVA', admin: { position: 'sidebar' } },
    { name: 'deliveryCost', type: 'number', required: true, label: 'Livraison', admin: { position: 'sidebar' } },
    { name: 'total', type: 'number', required: true, label: 'Total', admin: { position: 'sidebar' } },
    { name: 'amountToCollect', type: 'number', min: 0, label: 'Montant a encaisser', admin: { position: 'sidebar' } },
    { name: 'currency', type: 'text', defaultValue: 'TND', required: true, label: 'Devise', admin: { position: 'sidebar' } },
    { name: 'customerNote', type: 'textarea' },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'fr',
      options: [
        { label: 'French', value: 'fr' },
        { label: 'Arabic', value: 'ar' }
      ],
      required: true
    },
    { name: 'internalNote', type: 'textarea', label: 'Note interne', admin: { description: 'Visible uniquement par les administrateurs.', position: 'sidebar' } },
    { name: 'confirmationNotes', type: 'textarea' },
    { name: 'confirmedAt', type: 'date' },
    { name: 'confirmedBy', type: 'relationship', relationTo: 'users' },
    {
      name: 'statusTimestamps',
      type: 'group',
      fields: [
        { name: 'receivedAt', type: 'date' },
        { name: 'confirmedAt', type: 'date' },
        { name: 'shippedAt', type: 'date' },
        { name: 'deliveredAt', type: 'date' },
        { name: 'cancelledAt', type: 'date' }
      ]
    }
  ]
}
