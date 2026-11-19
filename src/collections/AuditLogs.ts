import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    defaultColumns: ['event', 'entityType', 'entityReference', 'admin', 'createdAt'],
    group: 'Configuration',
    useAsTitle: 'event'
  },
  labels: {
    plural: "Journal d'activité",
    singular: "Entrée d'activité"
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin
  },
  fields: [
    { name: 'event', type: 'text', required: true, index: true },
    { name: 'entityType', type: 'text', required: true, index: true },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'entityReference', type: 'text', required: true },
    { name: 'admin', type: 'relationship', relationTo: 'users' },
    { name: 'summary', type: 'textarea' },
    { name: 'metadata', type: 'json' }
  ]
}
