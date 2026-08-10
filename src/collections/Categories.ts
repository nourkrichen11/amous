import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { activeOnly, isAdmin } from '@/access/isAdmin'

async function getAncestorIds({
  categoryId,
  payload
}: {
  categoryId: number | string
  payload: { findByID: (args: { collection: 'categories'; depth?: number; id: number | string; locale?: string; overrideAccess?: boolean }) => Promise<{ id: number | string; parent?: number | string | { id: number | string } | null }> }
}) {
  const ancestors: Array<number | string> = []
  let cursor: number | string | null | undefined = categoryId

  while (cursor) {
    const doc = await payload.findByID({
      collection: 'categories',
      depth: 0,
      id: cursor,
      locale: 'fr',
      overrideAccess: true
    })

    const parent = typeof doc.parent === 'object' && doc.parent ? doc.parent.id : doc.parent
    if (!parent) {
      break
    }

    ancestors.push(parent)
    cursor = parent

    if (ancestors.length > 8) {
      break
    }
  }

  return ancestors
}

const validateCategoryHierarchy: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const nextParent = data?.parent ?? originalDoc?.parent
  const currentId = originalDoc?.id

  if (!nextParent) {
    return data
  }

  const parentId = typeof nextParent === 'object' ? nextParent.id : nextParent

  if (currentId && String(parentId) === String(currentId)) {
    throw new Error('Une categorie ne peut pas etre son propre parent.')
  }

  const ancestorIds = await getAncestorIds({
    categoryId: parentId,
    payload: req.payload
  })

  if (currentId && ancestorIds.some((ancestorId) => String(ancestorId) === String(currentId))) {
    throw new Error('La hierarchie de categories ne peut pas contenir de boucle.')
  }

  if (ancestorIds.length >= 2) {
    throw new Error('La navigation publique des categories est limitee a trois niveaux maximum.')
  }

  return data
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    defaultColumns: ['name', 'parent', 'displayOrder', 'showOnHomepage', 'active'],
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
    { name: 'slug', type: 'text', localized: true, required: true, unique: true, index: true },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      required: true
    },
    {
      name: 'longDescription',
      type: 'richText',
      localized: true
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Laissez vide pour une categorie parente.'
      }
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      validate: (value: unknown, { siblingData }: { siblingData?: { parent?: unknown } }) => {
        if (siblingData?.parent) {
          return true
        }

        if (!value) {
          return 'Une image est requise pour une categorie parente publiee.'
        }

        return true
      }
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      required: true
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true
    },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'icon',
      type: 'text'
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'noIndex', type: 'checkbox', defaultValue: false }
      ]
    }
  ],
  hooks: {
    beforeValidate: [validateCategoryHierarchy]
  }
}
