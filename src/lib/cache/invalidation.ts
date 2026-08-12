import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook
} from 'payload'

import { revalidateStorefrontTags, STOREFRONT_TAGS } from '@/lib/cache/storefront'

type SlugValue = { slug?: string | null } | null | undefined
type ProductValue = {
  category?: { slug?: string | null } | number | string | null
  promotionalProduct?: boolean | null
  slug?: string | null
} | null | undefined

function normalizeSlug(value: SlugValue) {
  const slug = value?.slug?.trim()

  return slug ? `category:${slug}` : undefined
}

function normalizeProductSlug(value: ProductValue) {
  const slug = value?.slug?.trim()

  return slug ? `product:${slug}` : undefined
}

function normalizeCategoryTag(value: ProductValue) {
  if (!value?.category || typeof value.category !== 'object') {
    return undefined
  }

  const slug = value.category.slug?.trim()

  return slug ? `category:${slug}` : undefined
}

async function invalidate(tags: Array<string | undefined>) {
  const resolvedTags = [...new Set(tags.filter((tag): tag is string => Boolean(tag)))]

  if (resolvedTags.length === 0) {
    return
  }

  await revalidateStorefrontTags(resolvedTags)
}

export const revalidateProductAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  await invalidate([
    STOREFRONT_TAGS.products,
    STOREFRONT_TAGS.homepage,
    doc?.promotionalProduct || previousDoc?.promotionalProduct ? STOREFRONT_TAGS.promotions : undefined,
    normalizeProductSlug(doc),
    normalizeProductSlug(previousDoc),
    normalizeCategoryTag(doc),
    normalizeCategoryTag(previousDoc)
  ])

  return doc
}

export const revalidateProductAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await invalidate([
    STOREFRONT_TAGS.products,
    STOREFRONT_TAGS.homepage,
    doc?.promotionalProduct ? STOREFRONT_TAGS.promotions : undefined,
    normalizeProductSlug(doc),
    normalizeCategoryTag(doc)
  ])
}

export const revalidateCategoryAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  await invalidate([
    STOREFRONT_TAGS.categories,
    STOREFRONT_TAGS.header,
    STOREFRONT_TAGS.homepage,
    normalizeSlug(doc),
    normalizeSlug(previousDoc)
  ])

  return doc
}

export const revalidateCategoryAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await invalidate([
    STOREFRONT_TAGS.categories,
    STOREFRONT_TAGS.header,
    STOREFRONT_TAGS.homepage,
    normalizeSlug(doc)
  ])
}

export const revalidateBrandAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  await invalidate([
    STOREFRONT_TAGS.brands,
    STOREFRONT_TAGS.homepage,
    doc?.slug ? `brand:${doc.slug}` : undefined,
    previousDoc?.slug ? `brand:${previousDoc.slug}` : undefined
  ])

  return doc
}

export const revalidateBrandAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await invalidate([STOREFRONT_TAGS.brands, STOREFRONT_TAGS.homepage, doc?.slug ? `brand:${doc.slug}` : undefined])
}

export function makeCollectionRevalidationHook(tags: string[]): CollectionAfterChangeHook {
  return async ({ doc }) => {
    await invalidate(tags)
    return doc
  }
}

export function makeCollectionDeleteRevalidationHook(tags: string[]): CollectionAfterDeleteHook {
  return async () => {
    await invalidate(tags)
  }
}

export function makeGlobalRevalidationHook(tags: string[]): GlobalAfterChangeHook {
  return async ({ doc }) => {
    await invalidate(tags)
    return doc
  }
}
