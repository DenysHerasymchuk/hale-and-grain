import { Link } from 'react-router'
import { Badge } from '@/components/base/badges/badges'
import { Price } from '@/components/Price/Price'
import type { AdminOrderListItem } from '@/features/admin/types'
import { orderStatusLabel, paymentStatusLabel } from '@/features/orders/orderLabels'
import { routePaths } from '@/Routes/routePaths'
import { AdminPanel, tableClass } from './AdminPageHeader'

export function OrdersTable({ orders }: { orders: AdminOrderListItem[] }) {
  if (orders.length === 0) return <p className="text-sm text-tertiary">No orders yet.</p>

  return (
    <AdminPanel className="overflow-x-auto">
      <table className={tableClass}>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Placed</th>
            <th scope="col">Status</th>
            <th scope="col">Payment</th>
            <th scope="col" className="text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link to={routePaths.adminOrder(order.id)} className="font-medium text-primary tabular-nums hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td>
                <span className="block text-primary">{order.fullName}</span>
                <span className="text-xs text-tertiary">{order.email}</span>
              </td>
              <td className="text-tertiary">{new Date(order.createdAt).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td>
                <Badge type="pill-color" color={order.status === 'cancelled' ? 'error' : order.status === 'delivered' ? 'success' : 'gray'} size="sm">
                  {orderStatusLabel(order.status)}
                </Badge>
              </td>
              <td className="text-xs text-tertiary">{paymentStatusLabel(order.paymentStatus)}</td>
              <td className="text-right font-medium">
                <Price amount={order.total} currency={order.currency} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPanel>
  )
}
