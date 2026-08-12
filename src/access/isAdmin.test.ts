import { describe, expect, it } from 'vitest'

import { isAdminBoolean, isAdminOrSameUserField } from './isAdmin'

describe('admin access helpers', () => {
  it('allows admin users to access admin-only areas', () => {
    expect(isAdminBoolean({ req: { user: { id: 1, role: 'admin' } } as never })).toBe(true)
  })

  it('denies customers from admin-only areas', () => {
    expect(isAdminBoolean({ req: { user: { id: 2, role: 'customer' } } as never })).toBe(false)
  })

  it('prevents customers from updating another user role field', () => {
    expect(
      isAdminOrSameUserField({
        id: 1,
        req: { user: { id: 2, role: 'customer' } }
      } as never)
    ).toBe(false)
  })

  it('allows admins to update role fields', () => {
    expect(
      isAdminOrSameUserField({
        id: 2,
        req: { user: { id: 1, role: 'admin' } }
      } as never)
    ).toBe(true)
  })
})
