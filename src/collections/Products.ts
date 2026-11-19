import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { activeOnly, isAdmin, isAdminField } from '@/access/isAdmin'
import { productUnits } from '@/config/commerce'
import { generateUniqueSku, generateUniqueSlug } from '@/features/catalogue/productIdentifiers'
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

/**
 * Slug/SKU are only ever generated when left empty — a manual entry (initial
 * or later override, e.g. via the Advanced tab) is never touched. This is the
 * actual source of truth; the live-preview Field components on slug/sku are
 * just a save-time-agnostic UX preview of what this hook will do.
 */
const generateProductIdentifiers: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const name = typeof data?.name === 'string' ? data.name : originalDoc?.name

  if (!name) {
    return data
  }

  const nextData = { ...data }

  if (!nextData.slug) {
    nextData.slug = await generateUniqueSlug(req.payload, name, originalDoc?.id)
  }

  if (!nextData.sku) {
    nextData.sku = await generateUniqueSku(req.payload, name, originalDoc?.id)
  }

  return nextData
}

/**
 * `reservedStock` must never be hand-edited from the raw admin form — it's
 * exclusively owned by the inventory service (src/features/inventory/service.ts),
 * whose every write already sets `context.skipStockMovement`. Reusing that
 * existing flag (rather than inventing new plumbing) is what lets a genuine
 * inventory-service write through while blocking a direct form edit.
 */
const guardReservedStockWrites: CollectionBeforeChangeHook = ({ context, data, operation, originalDoc }) => {
  if (operation !== 'update' || context.skipStockMovement) {
    return data
  }

  if ('reservedStock' in data && data.reservedStock !== originalDoc?.reservedStock) {
    throw new APIError('Le stock reserve est gere exclusivement par le systeme d\'inventaire.', 400)
  }

  return data
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
    afterDelete: [revalidateProductAfterDelete],
    beforeChange: [guardReservedStockWrites],
    beforeValidate: [generateProductIdentifiers]
  },
  fields: [
    {
      name: 'variantLabel',
      type: 'text',
      label: 'Variante',
      admin: {
        condition: (data) => Boolean(data?.parentProduct),
        description: 'Combinaison generee automatiquement (ex: Noir / S).',
        readOnly: true
      }
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informations',
          fields: [
            { name: 'name', type: 'text', localized: true, required: true, label: 'Nom du produit' },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              index: true,
              label: 'Categorie'
            },
            { name: 'brand', type: 'relationship', relationTo: 'brands', label: 'Marque' },
            { name: 'shortDescription', type: 'textarea', localized: true, label: 'Description courte' },
            { name: 'fullDescription', type: 'textarea', localized: true, label: 'Description complete' },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 8,
              label: 'Images du produit',
              admin: {
                description: 'JPEG, PNG ou WebP. Image carree recommandee. La premiere image est utilisee comme image principale.'
              }
            }
          ]
        },
        {
          label: 'Prix',
          fields: [
            {
              name: 'publicPrice',
              type: 'number',
              required: true,
              min: 0,
              label: 'Prix public',
              admin: {
                components: {
                  Field: '@/components/payload/AdminMoneyField#AdminMoneyField'
                },
                description: 'Prix affiche au client, TTC.'
              }
            },
            {
              name: 'previousPrice',
              type: 'number',
              min: 0,
              label: 'Ancien prix',
              admin: {
                components: {
                  Field: '@/components/payload/AdminMoneyField#AdminMoneyField'
                },
                description: 'Optionnel. Doit etre superieur au prix public pour afficher une reduction.'
              }
            },
            {
              type: 'collapsible',
              label: 'Interne — jamais affiche au client',
              admin: {
                initCollapsed: true
              },
              fields: [
                {
                  name: 'costPrice',
                  type: 'number',
                  access: {
                    // Collection-level read access above allows any unauthenticated
                    // visitor to read active products via REST/GraphQL — without this,
                    // that would include margin data despite this section's label being
                    // purely a UI cue, not backend enforcement.
                    read: isAdminField
                  },
                  min: 0,
                  label: 'Prix d\'achat',
                  admin: {
                    components: {
                      Field: '@/components/payload/AdminMoneyField#AdminMoneyField'
                    },
                    description: 'Prix interne. Jamais affiche publiquement.'
                  }
                },
                { name: 'vatRate', type: 'number', defaultValue: 19, min: 0, required: true, label: 'TVA (%)' }
              ]
            }
          ]
        },
        {
          label: 'Caracteristiques',
          fields: [
            {
              name: 'technicalAttributes',
              type: 'array',
              label: 'Caracteristiques',
              fields: [
                { name: 'label', type: 'text', localized: true, required: true },
                { name: 'value', type: 'text', localized: true, required: true },
                { name: 'unit', type: 'text' }
              ]
            }
          ]
        },
        {
          label: 'Variantes',
          fields: [
            {
              name: 'hasVariants',
              type: 'checkbox',
              defaultValue: false,
              label: 'Ce produit existe en plusieurs versions (taille, couleur...)',
              admin: {
                condition: (data) => !data?.parentProduct
              }
            },
            {
              name: 'variantAxes',
              type: 'array',
              label: 'Options de variantes',
              admin: {
                condition: (data) => Boolean(data?.hasVariants) && !data?.parentProduct,
                description: 'Ex: Couleur (Noir, Blanc), Taille (S, M, L, XL).'
              },
              fields: [
                { name: 'name', type: 'text', required: true, label: 'Nom de l\'option' },
                { name: 'options', type: 'array', label: 'Valeurs', fields: [{ name: 'value', type: 'text', required: true }] }
              ]
            },
            {
              name: 'parentProduct',
              type: 'relationship',
              relationTo: 'products',
              label: 'Produit parent',
              admin: {
                condition: (data) => Boolean(data?.parentProduct),
                description: 'Cette fiche est une variante generee depuis le produit parent.',
                readOnly: true
              }
            }
          ]
        },
        {
          label: 'Stock',
          fields: [
            {
              name: 'stockQuantity',
              type: 'number',
              defaultValue: 0,
              min: 0,
              required: true,
              label: 'Stock physique',
              admin: {
                condition: (data) => !data?.hasVariants || Boolean(data?.parentProduct)
              }
            },
            {
              name: 'reservedStock',
              type: 'number',
              defaultValue: 0,
              min: 0,
              required: true,
              label: 'Stock reserve',
              admin: {
                condition: (data) => !data?.hasVariants || Boolean(data?.parentProduct),
                description: 'Gere exclusivement par le systeme de commandes. Non modifiable manuellement.',
                readOnly: true
              }
            },
            {
              name: 'availableStock',
              type: 'number',
              label: 'Stock disponible',
              admin: {
                condition: (data) => !data?.hasVariants || Boolean(data?.parentProduct),
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
              name: 'lowStockThreshold',
              type: 'number',
              defaultValue: 10,
              min: 0,
              required: true,
              label: 'Seuil de stock faible',
              admin: {
                condition: (data) => !data?.hasVariants || Boolean(data?.parentProduct)
              }
            },
            {
              name: 'unit',
              type: 'select',
              defaultValue: 'piece',
              options: [...unitOptions],
              required: true,
              label: 'Unite'
            },
            { name: 'minimumOrderQuantity', type: 'number', defaultValue: 1, min: 1, required: true, label: 'Quantite minimum' },
            { name: 'quantityIncrement', type: 'number', defaultValue: 1, min: 1, required: true, label: 'Pas de quantite' }
          ]
        },
        {
          label: 'Avance',
          fields: [
            {
              type: 'collapsible',
              label: 'Parametres avances',
              admin: {
                initCollapsed: true
              },
              fields: [
                {
                  name: 'slug',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  label: 'URL / slug',
                  admin: {
                    components: {
                      Field: '@/components/payload/AdminSlugField#AdminSlugField'
                    },
                    description: 'Genere automatiquement depuis le nom du produit. Modifiable si necessaire.'
                  }
                },
                {
                  name: 'sku',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  label: 'SKU',
                  admin: {
                    components: {
                      Field: '@/components/payload/AdminSkuField#AdminSkuField'
                    },
                    description: 'Genere automatiquement. Modifiable si necessaire.'
                  }
                },
                { name: 'manufacturerReference', type: 'text', index: true, label: 'Reference fabricant' },
                { name: 'barcode', type: 'text', index: true, label: 'Code-barres' }
              ]
            }
          ]
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', localized: true, label: 'Titre SEO' },
                { name: 'description', type: 'textarea', localized: true, label: 'Description SEO' }
              ]
            }
          ]
        }
      ]
    },
    { name: 'active', type: 'checkbox', defaultValue: true, required: true, label: 'Publie', admin: { position: 'sidebar' } },
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
        position: 'sidebar',
        readOnly: true
      }
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'Mettre en avant', admin: { position: 'sidebar' } },
    { name: 'newProduct', type: 'checkbox', defaultValue: false, label: 'Nouveau produit', admin: { position: 'sidebar' } },
    { name: 'promotionalProduct', type: 'checkbox', defaultValue: false, label: 'Produit en promotion', admin: { position: 'sidebar' } },
    {
      name: 'promotionStartsAt',
      type: 'date',
      label: 'Debut de promotion',
      admin: { condition: (data) => Boolean(data?.promotionalProduct), position: 'sidebar' }
    },
    {
      name: 'promotionEndsAt',
      type: 'date',
      label: 'Fin de promotion',
      admin: { condition: (data) => Boolean(data?.promotionalProduct), position: 'sidebar' }
    }
  ]
}
