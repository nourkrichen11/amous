import type { Access, FieldAccess, PayloadRequest } from 'payload'

type RoleUser = {
  id?: number | string
  email?: string
  role?: 'admin' | 'customer'
}

export function isAdminRole(user?: RoleUser | null) {
  return user?.role === 'admin'
}

function sameID(left?: number | string, right?: number | string) {
  return left != null && right != null && String(left) === String(right)
}

export const isAdmin: Access = ({ req }) => {
  return isAdminRole(req.user as RoleUser | null)
}

export const isAdminBoolean = ({ req }: { req: PayloadRequest }) => {
  return isAdminRole(req.user as RoleUser | null)
}

export const isAdminField: FieldAccess = ({ req }) => {
  return isAdminRole(req.user as RoleUser | null)
}

export const isAdminOrSameUserField: FieldAccess = ({ id, req }) => {
  const user = req.user as RoleUser | null

  return isAdminRole(user) || sameID(user?.id, id as number | string | undefined)
}

export const activeOnly: Access = ({ req }) => {
  if (isAdminRole(req.user as RoleUser | null)) {
    return true
  }

  return {
    active: {
      equals: true
    }
  }
}

export const isAdminOrSelf: Access = ({ req }) => {
  const user = req.user as RoleUser | null

  if (!user) {
    return false
  }

  if (isAdminRole(user)) {
    return true
  }

  return {
    id: {
      equals: user.id
    }
  }
}

export const isAdminOrOwnOrder: Access = ({ req }) => {
  const user = req.user as RoleUser | null

  if (!user || !user.id) {
    return false
  }

  if (isAdminRole(user)) {
    return true
  }

  const conditions: Record<string, unknown>[] = [
    {
      customer: {
        equals: user.id
      }
    }
  ]

  if (user.email) {
    conditions.push({
      customerEmail: {
        equals: user.email
      }
    })
  }

  return {
    or: conditions as never
  }
}
