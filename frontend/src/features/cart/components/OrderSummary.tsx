import type { ReactNode } from 'react'
import { Price } from '@/components/Price/Price'
import { cx } from '@/utils/cx'

interface OrderSummaryProps {
  subtotal: number
  /** Undefined while not yet known (cart page before a server quote). */
  shipping?: number
  total?: number
  currency?: string
  note?: ReactNode
  children?: ReactNode
  className?: string
}

export function OrderSummary({ subtotal, shipping, total, currency = 'EUR', note, children, className }: OrderSummaryProps) {
  return (
    <section aria-labelledby="order-summary-heading" className={cx('rounded-[var(--radius-card)] bg-secondary p-6 md:p-8', className)}>
      <h2 id="order-summary-heading" className="font-display text-2xl text-primary">
        Order summary
      </h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-tertiary">Subtotal</dt>
          <dd className="text-primary">
            <Price amount={subtotal} currency={currency} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-tertiary">Delivery</dt>
          <dd className="text-primary">{shipping === undefined ? 'Calculated at checkout' : shipping === 0 ? 'Free' : <Price amount={shipping} currency={currency} />}</dd>
        </div>
        {total !== undefined && (
          <div className="flex justify-between border-t border-primary pt-4 text-base font-medium">
            <dt className="text-primary">Total</dt>
            <dd className="text-primary">
              <Price amount={total} currency={currency} />
            </dd>
          </div>
        )}
      </dl>
      {note && <div className="mt-4 text-xs leading-relaxed text-tertiary">{note}</div>}
      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}
