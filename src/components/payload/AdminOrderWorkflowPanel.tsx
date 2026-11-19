import type { ServerComponentProps } from 'payload'

import { Money } from '@/components/admin/Money'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  getConfirmationStatusLabel,
  getFulfillmentStatusLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from '@/features/orders/status'
import { getAvailableActions } from '@/features/orders/workflow'

import { AdminOrderWorkflowActions } from './AdminOrderWorkflowActions'

type OrderItem = {
  productName?: string
  productSku?: string
  quantity?: number
}

type OrderData = {
  confirmationStatus?: string
  fulfillmentStatus?: string
  items?: OrderItem[]
  orderNumber?: string
  orderStatus?: string
  paymentStatus?: string
  total?: number
}

const RESERVED_STAGES = new Set(['unfulfilled', 'preparing', 'ready_to_ship'])
const FULFILLED_STAGES = new Set(['shipped', 'delivered'])

function lineBreakdown(fulfillmentStatus: string | undefined, orderStatus: string | undefined, quantity: number) {
  if (orderStatus === 'cancelled') {
    return { fulfilled: 0, reserved: 0, returned: 0 }
  }

  if (orderStatus === 'returned') {
    return { fulfilled: 0, reserved: 0, returned: quantity }
  }

  if (FULFILLED_STAGES.has(fulfillmentStatus ?? '')) {
    return { fulfilled: quantity, reserved: 0, returned: 0 }
  }

  if (RESERVED_STAGES.has(fulfillmentStatus ?? '')) {
    return { fulfilled: 0, reserved: quantity, returned: 0 }
  }

  return { fulfilled: 0, reserved: 0, returned: 0 }
}

export async function AdminOrderWorkflowPanel({ data, id }: ServerComponentProps) {
  const order = data as OrderData

  if (!id) {
    // Create view — no order exists yet, nothing to show.
    return null
  }

  const availableActions = getAvailableActions({
    confirmationStatus: order.confirmationStatus as never,
    fulfillmentStatus: order.fulfillmentStatus as never,
    id,
    orderStatus: order.orderStatus as never,
    paymentStatus: order.paymentStatus as never
  })

  return (
    <div className="amous-order-workflow-panel">
      <div className="amous-order-workflow-panel__badges">
        <StatusBadge variant="info">{getOrderStatusLabel(order.orderStatus)}</StatusBadge>
        <StatusBadge variant="neutral">{getConfirmationStatusLabel(order.confirmationStatus)}</StatusBadge>
        <StatusBadge variant="warning">{getPaymentStatusLabel(order.paymentStatus)}</StatusBadge>
        <StatusBadge variant="success">{getFulfillmentStatusLabel(order.fulfillmentStatus)}</StatusBadge>
      </div>

      {order.items && order.items.length > 0 ? (
        <div className="amous-table-wrap">
          <table className="amous-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th className="is-right">Commande</th>
                <th className="is-right">Reserve</th>
                <th className="is-right">Expedie</th>
                <th className="is-right">Retourne</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const quantity = item.quantity ?? 0
                const breakdown = lineBreakdown(order.fulfillmentStatus, order.orderStatus, quantity)

                return (
                  <tr key={`${item.productSku ?? index}`}>
                    <td>{item.productName ?? item.productSku ?? '—'}</td>
                    <td className="is-right">{quantity}</td>
                    <td className="is-right">{breakdown.reserved}</td>
                    <td className="is-right">{breakdown.fulfilled}</td>
                    <td className="is-right">{breakdown.returned}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {typeof order.total === 'number' ? (
        <p className="amous-order-workflow-panel__total">
          Total: <Money amount={order.total} />
        </p>
      ) : null}

      <AdminOrderWorkflowActions actions={availableActions} orderId={id} />
    </div>
  )
}
