import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { activeOnly, isAdmin } from '@/access/isAdmin'
import { productUnits } from '@/config/commerce'
import { getStockStatus } from '@/features/inventory/status'
import { createAuditLog } from '@/lib/audit'
import { revalidateProductAfterChange, revalidateProductAfterDelete } from '@/lib/cache/invalidation'

export const unitOptions = productUnits

const recordManualStockMovement: CollectionAfterChangeHook = async ({ context, doc, operation, previousDoc, req }) => {
  if (context.skipStockMovement || operation !== 'update') {
    return doc
  }

  const previousQuantity = typeof previousDoc?.stockQuantity === 'number' ? previousDoc.stockQuantity : 0
  const resultingQuantity = typeof doc.stockQuantity === 'number' ? doc.stockQuantity : previousQuantity
  const previousReservedStock = typeof previousDoc?.reservedStock === 'number' ? previousDoc.reservedStock : 0
  const resultingReservedStock = typeof doc.reservedStock === 'number' ? doc.reservedStock : previousReservedStock

  if (previousQuantity === resultingQuantity && previousReservedStock === resultingReservedStock) {
    return doc
  }

  await req.payload.create({
    collection: 'stock-movements',
    data: {
      admin: req.user?.id,
      previousQuantity,
      previousReservedStock,
      product: doc.id,
      quantityDelta: resultingQuantity - previousQuantity,
      reason: 'Modification manuelle du stock',
      resultingQuantity,
      resultingReservedStock,
      type: 'manual_adjustment'
    },
    overrideAccess: true,
    req
  })

  return doc
}

const auditProductChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  await createAuditLog(req.payload, {
    adminId: req.user?.id,
    entityId: doc.id,
    entityReference: doc.sku || doc.name || String(doc.id),
    entityType: 'product',
    event: operation === 'create' ? 'product_created' : 'product_changed',
    req,
    summary: operation === 'create' ? 'Produit cree' : 'Produit modifie'
  })

  return doc
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['name', 'sku', 'manufacturerReference', 'category', 'brand', 'publicPrice', 'stockStatus', 'active'],
    components: {
      views: {
        list: {
          Component: '@/components/payload/AdminProductsListView#AdminProductsListView'
        }
      }
    },
    group: 'Catalogue',
    listSearchableFields: ['name', 'sku', 'manufacturerReference'],
    pagination: {
      defaultLimit: 20,
      limits: [20, 50, 100]
    },
    useAsTitle: 'name'
  },
  labels: {
    plural: 'Produits',
    singular: 'Produit'
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: activeOnly,
    update: isAdmin
  },
  hooks: {
    afterChange: [recordManualStockMovement, auditProductChange, revalidateProductAfterChange],
    afterDelete: [revalidateProductAfterDelete]
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true, label: 'Nom du produit' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug' },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'manufacturerReference', type: 'text', index: true },
    { name: 'barcode', type: 'text', index: true },
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
      index: true,
      label: 'Categorie',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      label: 'Marque',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 8,
      label: 'Medias'
    },
    {
      name: 'publicPrice',
      type: 'number',
      required: true,
      min: 0,
      label: 'Prix public',
      admin: {
        description: 'En millimes. Exemple : 12500 = 12,500 DT.',
        position: 'sidebar'
      }
    },
    {
      name: 'previousPrice',
      type: 'number',
      min: 0,
      label: 'Ancien prix',
      admin: {
        description: 'En millimes. Doit etre superieur au prix public pour afficher une reduction.',
        position: 'sidebar'
      }
    },
    {
      name: 'costPrice',
      type: 'number',
      min: 0,
      label: 'Prix d achat',
      admin: {
        description: 'Prix interne en millimes. Jamais affiche publiquement.',
        position: 'sidebar'
      }
    },
    { name: 'vatRate', type: 'number', defaultValue: 19, min: 0, required: true, label: 'TVA (%)', admin: { position: 'sidebar' } },
    { name: 'stockQuantity', type: 'number', defaultValue: 0, min: 0, required: true, label: 'Stock physique', admin: { position: 'sidebar' } },
    { name: 'reservedStock', type: 'number', defaultValue: 0, min: 0, required: true, label: 'Stock reserve', admin: { position: 'sidebar' } },
    { name: 'lowStockThreshold', type: 'number', defaultValue: 10, min: 0, required: true, label: 'Seuil de stock faible', admin: { position: 'sidebar' } },
    {
      name: 'stockStatus',
      type: 'select',
      defaultValue: 'in_stock',
      label: 'Etat du stock',
      options: [
        { label: 'En stock', value: 'in_stock' },
        { label: 'Stock faible', value: 'low_stock' },
        { label: 'Rupture de stock', value: 'out_of_stock' }
      ],
      required: true,
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'availableStock',
      type: 'number',
      label: 'Stock disponible',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calcule: stock physique - stock reserve.'
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const stockQuantity = typeof siblingData.stockQuantity === 'number' ? siblingData.stockQuantity : 0
            const reservedStock = typeof siblingData.reservedStock === 'number' ? siblingData.reservedStock : 0
            siblingData.stockStatus = getStockStatus({
              lowStockThreshold: typeof siblingData.lowStockThreshold === 'number' ? siblingData.lowStockThreshold : 10,
              reservedStock,
              stockQuantity
            })

            return Math.max(0, stockQuantity - reservedStock)
          }
        ]
      }
    },
    {
      name: 'unit',
      type: 'select',
      defaultValue: 'piece',
      options: [...unitOptions],
      required: true,
      label: 'Unite',
      admin: {
        position: 'sidebar'
      }
    },
    { name: 'minimumOrderQuantity', type: 'number', defaultValue: 1, min: 1, required: true, label: 'Quantite minimum', admin: { position: 'sidebar' } },
    { name: 'quantityIncrement', type: 'number', defaultValue: 1, min: 1, required: true, label: 'Pas de quantite', admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'Mettre en avant', admin: { position: 'sidebar' } },
    { name: 'newProduct', type: 'checkbox', defaultValue: false, label: 'Nouveau produit', admin: { position: 'sidebar' } },
    { name: 'promotionalProduct', type: 'checkbox', defaultValue: false, label: 'Produit en promotion', admin: { position: 'sidebar' } },
    { name: 'promotionStartsAt', type: 'date', label: 'Debut de promotion', admin: { position: 'sidebar' } },
    { name: 'promotionEndsAt', type: 'date', label: 'Fin de promotion', admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true, label: 'Actif', admin: { position: 'sidebar' } },
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
