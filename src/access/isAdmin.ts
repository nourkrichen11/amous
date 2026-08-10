import type { Access, FieldAccess, PayloadRequest } from 'payload'

type RoleUser = {
  id?: number | string
  email?: string
  role?: 'admin' | 'customer'
}

export const isAdmin: Access = ({ req }) => {
  return (req.user as RoleUser | null)?.role === 'admin'
}

export const isAdminBoolean = ({ req }: { req: PayloadRequest }) => {
  return (req.user as RoleUser | null)?.role === 'admin'
}

export const isAdminField: FieldAccess = ({ req }) => {
  return (req.user as RoleUser | null)?.role === 'admin'
}

export const activeOnly: Access = ({ req }) => {
  if ((req.user as RoleUser | null)?.role === 'admin') {
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

  if (user.role === 'admin') {
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

  if (user.role === 'admin') {
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
