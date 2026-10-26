import { Link } from 'react-router'
import { Badge } from '@/components/base/badges/badges'
import { Price } from '@/components/Price/Price'
import { countryName } from '@/features/checkout/shippingCountries'
import { routePaths } from '@/Routes/routePaths'
import type { Order } from '@/types/api'
import { orderStatusLabel, paymentStatusLabel } from './orderLabels'

/** Read-only order view shared by the confirmation, guest lookup, account and admin pages. */
export function OrderDetails({ order }: { order: Order }) {
  const placed = new Date(order.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="order-items">
        <h2 id="order-items" className="sr-only">
          Items
        </h2>
        <ul className="divide-y divide-border-secondary border-y border-secondary">
          {order.lines.map((line) => (
            <li key={line.sku} className="flex gap-4 py-5">
              {line.imageUrl && <img src={line.imageUrl} alt="" className="aspect-[4/5] w-20 rounded-[var(--radius-card)] object-cover" />}
              <div className="flex-1 text-sm">
                <Link to={routePaths.product(line.productSlug)} className="font-display text-lg text-primary hover:underline">
                  {line.productName}
                </Link>
                <p className="mt-1 text-tertiary">
                  {line.variantName} &middot; {line.sku}
                </p>
                <p className="mt-1 text-tertiary">
                  {line.quantity} × <Price amount={line.unitPrice} currency={order.currency} />
                </p>
              </div>
              <Price amount={line.lineTotal} currency={order.currency} className="text-sm font-medium text-primary" />
            </li>
          ))}
        </ul>
        <dl className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-tertiary">Subtotal</dt>
            <dd>
              <Price amount={order.subtotal} currency={order.currency} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-tertiary">Delivery</dt>
            <dd>{order.shippingCost === 0 ? 'Free' : <Price amount={order.shippingCost} currency={order.currency} />}</dd>
          </div>
          <div className="flex justify-between border-t border-secondary pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd>
              <Price amount={order.total} currency={order.currency} />
            </dd>
          </div>
        </dl>
      </section>

      <aside className="space-y-6 rounded-[var(--radius-card)] bg-secondary p-6 text-sm">
        <div>
          <h2 className="eyebrow">Order</h2>
          <p className="mt-2 font-medium text-primary tabular-nums">{order.orderNumber}</p>
          <p className="text-tertiary">Placed {placed}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge type="pill-color" color="gray" size="md">
            {orderStatusLabel(order.status)}
          </Badge>
          <Badge type="pill-color" color={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="md">
            {paymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
        <div>
          <h2 className="eyebrow">Delivering to</h2>
          <address className="mt-2 leading-relaxed text-secondary not-italic">
            {order.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && (
              <>
                <br />
                {order.shippingAddress.line2}
              </>
            )}
            <br />
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
            <br />
            {countryName(order.shippingAddress.country)}
          </address>
        </div>
        <div>
          <h2 className="eyebrow">Contact</h2>
          <p className="mt-2 text-secondary">{order.email}</p>
          {order.phone && <p className="text-secondary">{order.phone}</p>}
        </div>
      </aside>
    </div>
  )
}
