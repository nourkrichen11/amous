'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { Locale } from '@/i18n/config'
import { getCurrentUser } from '@/features/auth/session'

import { clearCartCookie, getCartCookie, setCartCookie } from './cookies'
import { createCashOnDeliveryOrder } from './orderService'
import { addProductToCart, clearCart, removeCartItem, updateCartItem } from './service'
import { checkoutSchema, quantitySchema } from './validation'

function formString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function asLocale(value: string): Locale {
  return value === 'ar' ? 'ar' : 'fr'
}

export async function addToCartAction(formData: FormData) {
  const locale = asLocale(formString(formData, 'locale'))
  const productId = formString(formData, 'productId')
  const parsedQuantity = quantitySchema.safeParse(formData.get('quantity'))
  const sourcePath = formString(formData, 'sourcePath') || `/${locale}/panier`

  if (!productId || !parsedQuantity.success) {
    redirect(`${sourcePath}?cartError=invalid_quantity`)
  }

  const result = await addProductToCart(await getCartCookie(), locale, productId, parsedQuantity.data)

  if (result.cart?.identifier) {
    await setCartCookie(result.cart.identifier)
  }

  revalidatePath(sourcePath)
  revalidatePath(`/${locale}/panier`)

  if (result.issue) {
    redirect(`${sourcePath}?cartError=${result.issue.code}`)
  }

  redirect(`${sourcePath}?cart=added`)
}

export async function updateCartItemAction(formData: FormData) {
  const locale = asLocale(formString(formData, 'locale'))
  const itemId = formString(formData, 'itemId')
  const parsedQuantity = quantitySchema.safeParse(formData.get('quantity'))

  if (itemId && parsedQuantity.success) {
    await updateCartItem(await getCartCookie(), itemId, parsedQuantity.data)
  }

  revalidatePath(`/${locale}/panier`)
  redirect(`/${locale}/panier`)
}

export async function removeCartItemAction(formData: FormData) {
  const locale = asLocale(formString(formData, 'locale'))
  const itemId = formString(formData, 'itemId')

  if (itemId) {
    await removeCartItem(await getCartCookie(), itemId)
  }

  revalidatePath(`/${locale}/panier`)
  redirect(`/${locale}/panier`)
}

export async function clearCartAction(formData: FormData) {
  const locale = asLocale(formString(formData, 'locale'))
  await clearCart(await getCartCookie())
  await clearCartCookie()
  revalidatePath(`/${locale}/panier`)
  redirect(`/${locale}/panier`)
}

export async function createOrderAction(formData: FormData) {
  const locale = asLocale(formString(formData, 'locale'))
  const parsed = checkoutSchema.safeParse({
    addressLine1: formString(formData, 'addressLine1'),
    city: formString(formData, 'city'),
    customerNote: formString(formData, 'customerNote') || undefined,
    deliveryInstructions: formString(formData, 'deliveryInstructions') || undefined,
    deliveryMethod: formString(formData, 'deliveryMethod'),
    email: formString(formData, 'email'),
    firstName: formString(formData, 'firstName'),
    governorate: formString(formData, 'governorate'),
    idempotencyKey: formString(formData, 'idempotencyKey'),
    lastName: formString(formData, 'lastName'),
    paymentMethod: formString(formData, 'paymentMethod'),
    phone: formString(formData, 'phone').replaceAll(' ', ''),
    postalCode: formString(formData, 'postalCode'),
    terms: formString(formData, 'terms')
  })

  if (!parsed.success) {
    redirect(`/${locale}/commande?error=validation`)
  }

  const result = await createCashOnDeliveryOrder(await getCartCookie(), locale, parsed.data, await getCurrentUser())

  if (!result.ok) {
    const error = result.fieldErrors ? Object.values(result.fieldErrors)[0] : result.formError
    redirect(`/${locale}/commande?error=${error}`)
  }

  await clearCartCookie()
  revalidatePath(`/${locale}/panier`)
  redirect(`/${locale}/commande/confirmation/${result.orderNumber}?token=${result.token}`)
}
