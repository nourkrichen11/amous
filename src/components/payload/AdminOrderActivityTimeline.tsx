import type { ServerComponentProps } from 'payload'

import {
  getConfirmationStatusLabel,
  getFulfillmentStatusLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from '@/features/orders/status'

type OrderEventDoc = {
  admin?: { firstName?: string; lastName?: string } | null | number | string
  createdAt?: string
  eventType?: string
  metadata?: Record<string, unknown> | null
  newState?: Record<string, unknown> | null
  note?: string | null
  previousState?: Record<string, unknown> | null
}

const FIELD_LABELS: Record<string, (value: unknown) => string> = {
  confirmationStatus: (value) => getConfirmationStatusLabel(String(value ?? '')),
  fulfillmentStatus: (value) => getFulfillmentStatusLabel(String(value ?? '')),
  orderStatus: (value) => getOrderStatusLabel(String(value ?? '')),
  paymentStatus: (value) => getPaymentStatusLabel(String(value ?? ''))
}

const EVENT_VERBS: Record<string, string> = {
  fulfillment_delivered: 'Marquee livree',
  fulfillment_ready_to_ship: 'Marquee prete a expedier',
  fulfillment_shipped: 'Expediee',
  fulfillment_started: 'Preparation demarree',
  order_cancelled: 'Annulee',
  order_confirmed: 'Confirmee',
  order_created: 'Commande creee',
  order_rejected: 'Rejetee',
  order_returned: 'Marquee retournee',
  payment_recorded: 'Paiement enregistre',
  refund_recorded: 'Remboursement enregistre'
}

function actorName(admin: OrderEventDoc['admin']) {
  if (admin && typeof admin === 'object') {
    const name = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim()
    return name || 'Administrateur'
  }
  return admin ? 'Administrateur' : 'Systeme'
}

function formatDate(value?: string) {
  if (!value) {
    return ''
  }
  try {
    return new Intl.DateTimeFormat('fr-TN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

function describeEvent(event: OrderEventDoc) {
  const verb = event.eventType ? EVENT_VERBS[event.eventType] : undefined

  if (verb) {
    if (event.eventType === 'refund_recorded' && typeof event.metadata?.amount === 'number') {
      return `${verb} (${(event.metadata.amount / 1000).toFixed(3)} DT)`
    }
    return verb
  }

  if (event.eventType === 'order_status_changed' && event.previousState && event.newState) {
    const changes = Object.keys(event.newState)
      .filter((key) => FIELD_LABELS[key] && event.newState?.[key] !== event.previousState?.[key])
      .map((key) => `${FIELD_LABELS[key](event.previousState?.[key])} → ${FIELD_LABELS[key](event.newState?.[key])}`)

    if (changes.length > 0) {
      return changes.join(', ')
    }
  }

  return event.eventType || 'Evenement'
}

export async function AdminOrderActivityTimeline({ id, payload }: ServerComponentProps) {
  if (!id) {
    return null
  }

  const result = await payload.find({
    collection: 'order-events',
    depth: 1,
    overrideAccess: true,
    pagination: false,
    sort: '-createdAt',
    where: { order: { equals: id } }
  })

  const events = result.docs as unknown as OrderEventDoc[]

  if (events.length === 0) {
    return <p className="amous-empty-value">Aucun evenement enregistre.</p>
  }

  return (
    <ol className="amous-order-activity-timeline">
      {events.map((event, index) => (
        <li className="amous-order-activity-timeline__item" key={index}>
          <span className="amous-order-activity-timeline__summary">{describeEvent(event)}</span>
          <span className="amous-order-activity-timeline__meta">
            {actorName(event.admin)} · {formatDate(event.createdAt)}
          </span>
          {event.note ? <span className="amous-order-activity-timeline__note">{event.note}</span> : null}
        </li>
      ))}
    </ol>
  )
}
