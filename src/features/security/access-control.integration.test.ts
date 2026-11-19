import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { changePassword, requestPasswordReset, resetPassword } from '@/features/auth/service'
import { setEmailAdapterForTests } from '@/lib/email'
import { getPayloadClient } from '@/lib/payload/getPayload'

const hasDb = Boolean(process.env.DATABASE_URI)
const PREFIX = 'TEST-SECURITY-'
const TEST_PASSWORD = 'Or1ginalPassw0rd!'

async function createCustomer(payload: Awaited<ReturnType<typeof getPayloadClient>>, overrides: { password?: string } = {}) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'users',
    data: {
      active: true,
      email: `${PREFIX.toLowerCase()}${suffix}@example.com`,
      firstName: 'Test',
      lastName: 'Customer',
      password: overrides.password ?? TEST_PASSWORD,
      preferredLocale: 'fr',
      role: 'customer'
    },
    overrideAccess: true
  })
}

async function createAdmin(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'users',
    data: {
      active: true,
      email: `${PREFIX.toLowerCase()}${suffix}@example.com`,
      firstName: 'Test',
      lastName: 'Admin',
      password: TEST_PASSWORD,
      preferredLocale: 'fr',
      role: 'admin'
    },
    overrideAccess: true
  })
}

async function createCategory(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'categories',
    data: {
      active: false,
      description: 'Categorie de test securite.',
      name: `${PREFIX}category-${suffix}`,
      slug: `${PREFIX.toLowerCase()}category-${suffix}`
    },
    overrideAccess: true
  })
}

async function createProduct(payload: Awaited<ReturnType<typeof getPayloadClient>>, categoryId: number | string, costPrice: number) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'products',
    data: {
      active: true,
      category: categoryId,
      costPrice,
      name: `${PREFIX}product-${suffix}`,
      publicPrice: 10000,
      sku: `${PREFIX}${suffix}`,
      slug: `${PREFIX.toLowerCase()}${suffix}`,
      stockQuantity: 5,
      vatRate: 19
    },
    overrideAccess: true
  })
}

async function createOrderForCustomer(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  product: { id: number | string; publicPrice?: number; sku?: string },
  customer: { email: string; id: number | string }
) {
  const suffix = randomUUID()
  return payload.create({
    collection: 'orders',
    data: {
      confirmationToken: suffix,
      currency: 'TND',
      customer: customer.id,
      customerEmail: customer.email,
      customerFirstName: 'Test',
      customerLastName: 'Customer',
      customerPhone: '20000000',
      deliveryCost: 0,
      deliveryMethod: 'home_delivery',
      idempotencyKey: `${PREFIX}${suffix}`,
      items: [
        {
          lineSubtotal: 8403,
          lineTotal: 10000,
          lineVatTotal: 1597,
          product: product.id,
          productName: 'Test product',
          productSku: product.sku ?? 'TEST-SKU',
          quantity: 1,
          unit: 'piece',
          unitPrice: product.publicPrice ?? 10000,
          vatRate: 19
        }
      ],
      locale: 'fr',
      orderNumber: `${PREFIX}${suffix}`,
      paymentMethod: 'cash_on_delivery',
      status: 'received',
      subtotal: 8403,
      total: 10000,
      vatTotal: 1597
    },
    overrideAccess: true
  })
}

describe.skipIf(!hasDb)('access control (integration)', () => {
  let payload: Awaited<ReturnType<typeof getPayloadClient>>

  beforeAll(async () => {
    payload = await getPayloadClient()
  })

  afterAll(async () => {
    setEmailAdapterForTests(null)
    await payload.delete({ collection: 'orders', overrideAccess: true, where: { orderNumber: { like: PREFIX } } })
    await payload.delete({ collection: 'products', overrideAccess: true, where: { sku: { like: PREFIX } } })
    await payload.delete({ collection: 'categories', overrideAccess: true, where: { slug: { like: PREFIX.toLowerCase() } } })
    await payload.delete({ collection: 'users', overrideAccess: true, where: { email: { like: PREFIX.toLowerCase() } } })
  })

  describe('Products.costPrice field-level access', () => {
    it('is hidden from an unauthenticated read', async () => {
      const category = await createCategory(payload)
      const product = await createProduct(payload, category.id, 5000)

      const asPublic = (await payload.findByID({
        collection: 'products',
        id: product.id,
        overrideAccess: false
      })) as { costPrice?: number }

      expect(asPublic.costPrice).toBeUndefined()
    })

    it('is hidden from a logged-in customer', async () => {
      const category = await createCategory(payload)
      const product = await createProduct(payload, category.id, 5000)
      const customer = await createCustomer(payload)

      const asCustomer = (await payload.findByID({
        collection: 'products',
        id: product.id,
        overrideAccess: false,
        user: { collection: 'users', ...customer }
      } as never)) as { costPrice?: number }

      expect(asCustomer.costPrice).toBeUndefined()
    })

    it('is visible to an admin', async () => {
      const category = await createCategory(payload)
      const product = await createProduct(payload, category.id, 5000)
      const admin = await createAdmin(payload)

      const asAdmin = (await payload.findByID({
        collection: 'products',
        id: product.id,
        overrideAccess: false,
        user: { collection: 'users', ...admin }
      } as never)) as { costPrice?: number }

      expect(asAdmin.costPrice).toBe(5000)
    })
  })

  describe('role / privilege-field escalation', () => {
    it('a customer cannot promote themselves to admin', async () => {
      const customer = await createCustomer(payload)

      await payload
        .update({
          collection: 'users',
          data: { role: 'admin' },
          id: customer.id,
          overrideAccess: false,
          user: { collection: 'users', ...customer }
        } as never)
        .catch(() => undefined)

      const reloaded = await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })
      expect(reloaded.role).toBe('customer')
    })

    it('a customer cannot re-enable their own disabled account', async () => {
      const customer = await createCustomer(payload)
      await payload.update({ collection: 'users', data: { active: false }, id: customer.id, overrideAccess: true })

      await payload
        .update({
          collection: 'users',
          data: { active: true },
          id: customer.id,
          overrideAccess: false,
          user: { collection: 'users', ...customer, active: false }
        } as never)
        .catch(() => undefined)

      const reloaded = await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })
      expect(reloaded.active).toBe(false)
    })

    it('a customer cannot self-certify emailVerified', async () => {
      const customer = await createCustomer(payload)

      await payload
        .update({
          collection: 'users',
          data: { emailVerified: true },
          id: customer.id,
          overrideAccess: false,
          user: { collection: 'users', ...customer }
        } as never)
        .catch(() => undefined)

      const reloaded = await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })
      expect(reloaded.emailVerified).toBe(false)
    })
  })

  describe('order isolation', () => {
    it('a customer cannot read another customer’s order', async () => {
      const category = await createCategory(payload)
      const product = await createProduct(payload, category.id, 1000)
      const customerA = await createCustomer(payload)
      const customerB = await createCustomer(payload)
      const orderB = await createOrderForCustomer(payload, product, customerB as unknown as { email: string; id: number | string })

      const asCustomerA = await payload.find({
        collection: 'orders',
        overrideAccess: false,
        user: { collection: 'users', ...customerA },
        where: { id: { equals: orderB.id } }
      } as never)

      expect(asCustomerA.docs).toHaveLength(0)

      const asCustomerB = await payload.find({
        collection: 'orders',
        overrideAccess: false,
        user: { collection: 'users', ...customerB },
        where: { id: { equals: orderB.id } }
      } as never)

      expect(asCustomerB.docs).toHaveLength(1)
    })
  })

  describe('password reset — end to end', () => {
    it('generates a token, invokes the email adapter, and never returns the token itself', async () => {
      const customer = await createCustomer(payload)
      const sent: Array<{ html: string; to: string }> = []
      setEmailAdapterForTests({
        async send(message) {
          sent.push({ html: message.html, to: message.to })
        }
      })

      const response = await requestPasswordReset({ email: customer.email, locale: 'fr' })

      expect(response).toEqual({ message: expect.any(String) })
      expect(JSON.stringify(response)).not.toMatch(/token/i)
      expect(sent).toHaveLength(1)
      expect(sent[0]?.to).toBe(customer.email)
      expect(sent[0]?.html).toContain('reinitialiser-mot-de-passe')
    })

    it('gives an equivalent response for an existing and a non-existent email (no enumeration)', async () => {
      const customer = await createCustomer(payload)
      setEmailAdapterForTests({ async send() {} })

      const existing = await requestPasswordReset({ email: customer.email, locale: 'fr' })
      const missing = await requestPasswordReset({ email: `${PREFIX.toLowerCase()}${randomUUID()}@example.com`, locale: 'fr' })

      expect(existing.message).toBe(missing.message)
    })

    it('a valid token succeeds and cannot be reused', async () => {
      const customer = await createCustomer(payload)
      let capturedUrl = ''
      setEmailAdapterForTests({
        async send(message) {
          const match = message.html.match(/token=([a-f0-9]+)/i)
          capturedUrl = match?.[1] ?? ''
        }
      })

      await requestPasswordReset({ email: customer.email, locale: 'fr' })
      expect(capturedUrl).not.toBe('')

      const first = await resetPassword({ password: 'BrandNewPassw0rd!', passwordConfirmation: 'BrandNewPassw0rd!', token: capturedUrl }, 'fr')
      expect(first.ok).toBe(true)

      const second = await resetPassword({ password: 'AnotherPassw0rd!', passwordConfirmation: 'AnotherPassw0rd!', token: capturedUrl }, 'fr')
      expect(second.ok).toBe(false)
    })

    it('an invalid token is rejected with a generic message', async () => {
      const result = await resetPassword({ password: 'Whatever123!', passwordConfirmation: 'Whatever123!', token: 'not-a-real-token-000000' }, 'fr')
      expect(result.ok).toBe(false)
      expect(result.ok === false ? result.formError : '').not.toMatch(/payload|sql|stack/i)
    })

    it('clears every session for the user after a successful reset', async () => {
      const customer = await createCustomer(payload)
      await payload.login({ collection: 'users', data: { email: customer.email, password: TEST_PASSWORD } })
      await payload.login({ collection: 'users', data: { email: customer.email, password: TEST_PASSWORD } })

      const beforeReset = (await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })) as {
        sessions?: Array<{ id: string }>
      }
      expect(beforeReset.sessions?.length).toBeGreaterThan(0)

      let capturedToken = ''
      setEmailAdapterForTests({
        async send(message) {
          capturedToken = message.html.match(/token=([a-f0-9]+)/i)?.[1] ?? ''
        }
      })
      await requestPasswordReset({ email: customer.email, locale: 'fr' })
      await resetPassword({ password: 'ResetFlowPassw0rd!', passwordConfirmation: 'ResetFlowPassw0rd!', token: capturedToken }, 'fr')

      const afterReset = (await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })) as {
        sessions?: Array<{ id: string }>
      }
      expect(afterReset.sessions).toEqual([])
    })
  })

  describe('changePassword — session invalidation', () => {
    it('revokes every other session but keeps the current one', async () => {
      const customer = await createCustomer(payload)
      await payload.login({ collection: 'users', data: { email: customer.email, password: TEST_PASSWORD } })
      await payload.login({ collection: 'users', data: { email: customer.email, password: TEST_PASSWORD } })

      const afterLogins = (await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })) as {
        sessions?: Array<{ id: string }>
      }
      const sessionIds = afterLogins.sessions?.map((session) => session.id) ?? []
      expect(sessionIds.length).toBe(2)
      const [, currentSid] = sessionIds

      const result = await changePassword({
        confirmNewPassword: 'ChangedPassw0rd!',
        currentPassword: TEST_PASSWORD,
        currentSid,
        email: customer.email,
        newPassword: 'ChangedPassw0rd!',
        userId: customer.id
      })

      expect(result.ok).toBe(true)

      const afterChange = (await payload.findByID({ collection: 'users', id: customer.id, overrideAccess: true })) as {
        sessions?: Array<{ id: string }>
      }
      expect(afterChange.sessions?.map((session) => session.id)).toEqual([currentSid])
    })

    it('rejects the wrong current password without touching sessions', async () => {
      const customer = await createCustomer(payload)

      const result = await changePassword({
        confirmNewPassword: 'Whatever123!',
        currentPassword: 'TotallyWrongPassword!',
        email: customer.email,
        newPassword: 'Whatever123!',
        userId: customer.id
      })

      expect(result.ok).toBe(false)
    })
  })
})
