import type { CollectionConfig } from 'payload'

import { activeOnly, isAdmin } from '@/access/isAdmin'

export const unitOptions = [
  { label: 'Piece', value: 'piece' },
  { label: 'Box', value: 'box' },
  { label: 'Metre', value: 'metre' },
  { label: 'Litre', value: 'litre' },
  { label: 'Kilogram', value: 'kilogram' },
  { label: 'Pack', value: 'pack' }
] as const

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['name', 'sku', 'category', 'publicPrice', 'stockStatus', 'active'],
    useAsTitle: 'name'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: activeOnly,
    update: isAdmin
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'shortDescription', type: 'textarea', localized: true },
    {
      name: 'fullDescription',
      type: 'textarea',
      localized: true
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands'
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 8
    },
    {
      name: 'publicPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Stored in millimes to avoid floating-point money errors. Example: 12500 = 12.500 TND.'
      }
    },
    {
      name: 'previousPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Stored in millimes. Must be greater than public price to display a discount.'
      }
    },
    { name: 'vatRate', type: 'number', defaultValue: 19, min: 0, required: true },
    { name: 'stockQuantity', type: 'number', defaultValue: 0, min: 0, required: true },
    {
      name: 'stockStatus',
      type: 'select',
      defaultValue: 'in_stock',
      options: [
        { label: 'In stock', value: 'in_stock' },
        { label: 'Low stock', value: 'low_stock' },
        { label: 'Out of stock', value: 'out_of_stock' }
      ],
      required: true
    },
    {
      name: 'unit',
      type: 'select',
      defaultValue: 'piece',
      options: [...unitOptions],
      required: true
    },
    { name: 'minimumOrderQuantity', type: 'number', defaultValue: 1, min: 1, required: true },
    { name: 'quantityIncrement', type: 'number', defaultValue: 1, min: 1, required: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'newProduct', type: 'checkbox', defaultValue: false },
    { name: 'promotionalProduct', type: 'checkbox', defaultValue: false },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true },
    {
      name: 'technicalAttributes',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'value', type: 'text', localized: true, required: true },
        { name: 'unit', type: 'text' }
      ]
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true }
      ]
    }
  ]
}
