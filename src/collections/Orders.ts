import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrOwnOrder } from '@/access/isAdmin'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'customerEmail', 'total', 'createdAt'],
    useAsTitle: 'orderNumber'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrOwnOrder,
    update: isAdmin
  },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true },
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
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'cash_on_delivery',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Cash on delivery', value: 'cash_on_delivery' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' }
      ],
      required: true
    },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'cash_on_delivery',
      options: [{ label: 'Cash on delivery', value: 'cash_on_delivery' }],
      required: true
    },
    { name: 'customerFirstName', type: 'text', required: true, index: true },
    { name: 'customerLastName', type: 'text', required: true, index: true },
    { name: 'customerEmail', type: 'email', required: true, index: true },
    { name: 'customerPhone', type: 'text', required: true, index: true },
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
    { name: 'subtotal', type: 'number', required: true },
    { name: 'vatTotal', type: 'number', required: true },
    { name: 'deliveryCost', type: 'number', required: true },
    { name: 'total', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'TND', required: true },
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
    { name: 'internalNote', type: 'textarea', admin: { description: 'Internal admin note. Never displayed publicly.' } },
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
