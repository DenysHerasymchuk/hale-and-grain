import { Link } from 'react-router'
import { Price } from '@/components/Price/Price'
import { orderStatusLabel } from '@/features/orders/orderLabels'
import { routePaths } from '@/Routes/routePaths'
import type { OrderSummary } from '@/types/api'

export function OrderList({ orders }: { orders: OrderSummary[] }) {
  return (
    <ul className="divide-y divide-border-secondary border-y border-secondary">
      {orders.map((order) => (
        <li key={order.orderNumber}>
          <Link to={routePaths.profileOrder(order.orderNumber)} className="grid grid-cols-2 gap-2 py-4 text-sm hover:bg-primary_hover sm:grid-cols-4 sm:items-center">
            <span className="font-medium text-primary tabular-nums">{order.orderNumber}</span>
            <span className="text-tertiary sm:text-center">{new Date(order.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-secondary">
              {orderStatusLabel(order.status)} &middot; {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
            </span>
            <Price amount={order.total} currency={order.currency} className="text-right font-medium text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
