import { cookies } from 'next/headers'

export const CART_COOKIE_NAME = 'amous_cart_id'
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function getCartCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE_NAME)?.value
}

export async function setCartCookie(identifier: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, identifier, {
    httpOnly: true,
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
}

export async function clearCartCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE_NAME)
}
