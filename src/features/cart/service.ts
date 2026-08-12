import { randomUUID } from 'node:crypto'
import type { Payload, Where } from 'payload'

import type { Locale } from '@/i18n/config'
import { calculateLine, calculateTotals } from '@/lib/money'
import { getPayloadClient } from '@/lib/payload/getPayload'

import type { CartIssue, CartLine, CartView } from './types'

type ID = string | number

type MediaDoc = {
  url?: string
}

type ProductDoc = {
  id: ID
  active?: boolean
  images?: Array<ID | MediaDoc>
  minimumOrderQuantity?: number
  name?: string
  publicPrice?: number
  quantityIncrement?: number
  sku?: string
  slug?: string
  stockQuantity?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  unit?: string
  vatRate?: number
}

type CartItemDoc = {
  id?: string
  lineTotal?: number
  product?: ID | ProductDoc
  productImageUrl?: string
  productName?: string
  productSku?: string
  quantity?: number
  unit?: string
  unitPrice?: number
  vatRate?: number
}

type CartDoc = {
  id: ID
  anonymousSessionIdentifier: string
  currency?: string
  expiresAt?: string
  identifier: string
  items?: CartItemDoc[]
  locale?: Locale
  status?: 'active' | 'converted' | 'abandoned'
}

function isProductDoc(value: unknown): value is ProductDoc {
  return typeof value === 'object' && value !== null && 'id' in value
}

function imageUrl(product: ProductDoc): string | undefined {
  const first = product.images?.[0]
  return typeof first === 'object' && first !== null && 'url' in first ? first.url : undefined
}

function productId(product: ID | ProductDoc | undefined): ID | undefined {
  if (!product) {
    return undefined
  }

  return isProductDoc(product) ? product.id : product
}

function expiresAt() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString()
}

function createCartLine(product: ProductDoc, quantity: number): CartItemDoc {
  const unitPrice = product.publicPrice ?? 0
  const vatRate = product.vatRate ?? 19
  const line = calculateLine(unitPrice, quantity, vatRate)

  return {
    lineTotal: line.lineTotal,
    product: product.id,
    productImageUrl: imageUrl(product),
    productName: product.name ?? 'Product',
    productSku: product.sku ?? '',
    quantity,
    unit: product.unit ?? 'piece',
    unitPrice,
    vatRate
  }
}

function writableItem(item: CartItemDoc): CartItemDoc {
  const id = productId(item.product)
  return {
    ...item,
    product: id ?? item.product
  }
}

function writableItems(items: CartItemDoc[]): CartItemDoc[] {
  return items.map((item) => writableItem(item))
}

export async function findCartByIdentifier(identifier?: string): Promise<CartDoc | null> {
  if (!identifier) {
    return null
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'carts',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ identifier: { equals: identifier } }, { status: { equals: 'active' } }]
    }
  })

  return (result.docs[0] as CartDoc | undefined) ?? null
}

export async function getCartCountByIdentifier(identifier?: string): Promise<number> {
  const cart = await findCartByIdentifier(identifier)

  if (!cart) {
    return 0
  }

  return (cart.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export async function createCart(locale: Locale): Promise<CartDoc> {
  const payload = await getPayloadClient()
  return payload.create({
    collection: 'carts',
    data: {
      anonymousSessionIdentifier: randomUUID(),
      currency: 'TND',
      expiresAt: expiresAt(),
      identifier: randomUUID(),
      items: [],
      locale,
      status: 'active'
    },
    overrideAccess: true
  }) as Promise<CartDoc>
}

export async function getOrCreateCart(identifier: string | undefined, locale: Locale): Promise<CartDoc> {
  const existing = await findCartByIdentifier(identifier)

  if (existing) {
    return existing
  }

  return createCart(locale)
}

async function getProductForValidation(payload: Payload, id: ID): Promise<ProductDoc | null> {
  try {
    return (await payload.findByID({
      collection: 'products',
      depth: 1,
      id,
      overrideAccess: true
    })) as ProductDoc
  } catch {
    return null
  }
}

export function validateQuantity(product: ProductDoc, requestedQuantity: number): { issue?: CartIssue; quantity: number } {
  const min = product.minimumOrderQuantity ?? 1
  const increment = product.quantityIncrement ?? 1
  const stock = product.stockQuantity ?? 0

  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    return {
      issue: { code: 'invalid_quantity', message: 'Invalid quantity.' },
      quantity: min
    }
  }

  let quantity = Math.max(requestedQuantity, min)

  if ((quantity - min) % increment !== 0) {
    quantity = min + Math.ceil((quantity - min) / increment) * increment
  }

  if (stock < quantity) {
    return {
      issue: { code: stock <= 0 ? 'out_of_stock' : 'quantity_reduced', message: 'Quantity adjusted to available stock.' },
      quantity: Math.max(0, stock)
    }
  }

  if (quantity !== requestedQuantity) {
    return {
      issue: { code: 'minimum_quantity_changed', message: 'Quantity adjusted to product rules.' },
      quantity
    }
  }

  return { quantity }
}

export async function addProductToCart(identifier: string | undefined, locale: Locale, productIdValue: ID, requestedQuantity: number) {
  const payload = await getPayloadClient()
  const product = await getProductForValidation(payload, productIdValue)

  if (!product || !product.active || !product.publicPrice || !product.sku || !product.name) {
    return { cart: null, issue: { code: 'product_unavailable', message: 'Product is unavailable.' } satisfies CartIssue }
  }

  if (product.stockStatus === 'out_of_stock' || (product.stockQuantity ?? 0) <= 0) {
    return { cart: null, issue: { code: 'out_of_stock', message: 'Product is out of stock.' } satisfies CartIssue }
  }

  const { issue, quantity } = validateQuantity(product, requestedQuantity)
  if (quantity < 1) {
    return { cart: null, issue: issue ?? ({ code: 'out_of_stock', message: 'Product is out of stock.' } satisfies CartIssue) }
  }

  const cart = await getOrCreateCart(identifier, locale)
  const items = writableItems([...(cart.items ?? [])])
  const existingIndex = items.findIndex((item) => String(productId(item.product)) === String(product.id))
  const existingQuantity = existingIndex >= 0 ? items[existingIndex]?.quantity ?? 0 : 0
  const finalQuantity = validateQuantity(product, existingQuantity + quantity).quantity
  const line = createCartLine(product, finalQuantity)

  if (existingIndex >= 0) {
    items[existingIndex] = { ...items[existingIndex], ...line }
  } else {
    items.push(line)
  }

  const updated = (await payload.update({
    collection: 'carts',
    data: {
      expiresAt: expiresAt(),
      items: writableItems(items),
      locale
    },
    id: cart.id,
    overrideAccess: true
  })) as CartDoc

  return { cart: updated, issue }
}

export async function updateCartItem(identifier: string | undefined, itemId: string, requestedQuantity: number) {
  const payload = await getPayloadClient()
  const cart = await findCartByIdentifier(identifier)

  if (!cart) {
    return null
  }

  const items = writableItems([...(cart.items ?? [])])
  const index = items.findIndex((item) => item.id === itemId)
  const item = items[index]
  const id = productId(item?.product)

  if (index < 0 || !item || !id) {
    return cart
  }

  const product = await getProductForValidation(payload, id)
  if (!product || !product.active) {
    items.splice(index, 1)
  } else {
    const { quantity } = validateQuantity(product, requestedQuantity)
    if (quantity < 1) {
      items.splice(index, 1)
    } else {
      items[index] = { ...item, ...createCartLine(product, quantity) }
    }
  }

  return payload.update({
    collection: 'carts',
    data: { items: writableItems(items) },
    id: cart.id,
    overrideAccess: true
  }) as Promise<CartDoc>
}

export async function removeCartItem(identifier: string | undefined, itemId: string) {
  const payload = await getPayloadClient()
  const cart = await findCartByIdentifier(identifier)

  if (!cart) {
    return null
  }

  return payload.update({
    collection: 'carts',
    data: {
      items: writableItems((cart.items ?? []).filter((item) => item.id !== itemId))
    },
    id: cart.id,
    overrideAccess: true
  }) as Promise<CartDoc>
}

export async function clearCart(identifier: string | undefined) {
  const payload = await getPayloadClient()
  const cart = await findCartByIdentifier(identifier)

  if (!cart) {
    return null
  }

  return payload.update({
    collection: 'carts',
    data: { items: [] },
    id: cart.id,
    overrideAccess: true
  }) as Promise<CartDoc>
}

export async function validateCart(identifier: string | undefined, locale: Locale): Promise<CartView> {
  const payload = await getPayloadClient()
  const cart = await findCartByIdentifier(identifier)

  if (!cart) {
    return {
      count: 0,
      currency: 'TND',
      issues: [],
      items: [],
      locale,
      subtotal: 0,
      total: 0,
      vatTotal: 0
    }
  }

  const issues: CartIssue[] = []
  const lines: CartLine[] = []
  const repairedItems: CartItemDoc[] = []

  for (const item of cart.items ?? []) {
    const id = productId(item.product)
    if (!id) {
      continue
    }

    const product = await getProductForValidation(payload, id)
    if (!product || !product.active || !product.publicPrice || !product.name || !product.sku) {
      issues.push({ code: 'product_unavailable', itemId: item.id, message: `${item.productName ?? 'Product'} is unavailable.` })
      continue
    }

    const requestedQuantity = item.quantity ?? 1
    const validation = validateQuantity(product, requestedQuantity)
    if (validation.issue) {
      issues.push({ ...validation.issue, itemId: item.id })
    }

    if (validation.quantity < 1) {
      continue
    }

    const snapshot = createCartLine(product, validation.quantity)
    const line = calculateLine(product.publicPrice, validation.quantity, product.vatRate ?? 19)
    repairedItems.push({ ...item, ...snapshot })
    lines.push({
      id: item.id,
      lineSubtotal: line.lineSubtotal,
      lineTotal: line.lineTotal,
      lineVatTotal: line.lineVatTotal,
      productId: product.id,
      productImageUrl: imageUrl(product),
      productName: product.name,
      productSku: product.sku,
      productSlug: product.slug,
      quantity: validation.quantity,
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus,
      unit: product.unit ?? 'piece',
      unitPrice: product.publicPrice,
      vatRate: product.vatRate ?? 19
    })

    if (item.unitPrice !== product.publicPrice) {
      issues.push({ code: 'price_changed', itemId: item.id, message: `${product.name} price changed.` })
    }
  }

  if (JSON.stringify(repairedItems) !== JSON.stringify(cart.items ?? [])) {
    await payload.update({
      collection: 'carts',
      data: { items: writableItems(repairedItems) },
      id: cart.id,
      overrideAccess: true
    })
  }

  const totals = calculateTotals(lines)

  return {
    cartId: String(cart.id),
    count: lines.reduce((sum, item) => sum + item.quantity, 0),
    currency: 'TND',
    issues,
    items: lines,
    locale: cart.locale ?? locale,
    subtotal: totals.subtotal,
    total: totals.total,
    vatTotal: totals.vatTotal
  }
}

export async function findOrder(orderNumber: string, token: string) {
  const payload = await getPayloadClient()
  const where: Where = {
    and: [{ orderNumber: { equals: orderNumber } }, { confirmationToken: { equals: token } }]
  }
  const result = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where
  })

  return result.docs[0] ?? null
}

export async function markCartConverted(cartId: ID, transactionID?: number | string | Promise<number | string>) {
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'carts',
    data: { status: 'converted' },
    id: cartId,
    overrideAccess: true,
    req: transactionID ? ({ transactionID } as never) : undefined
  })
}
