import { useState } from 'react'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useAdminOrders } from '@/features/admin/api'
import { orderStatuses, orderStatusLabel } from '@/features/orders/orderLabels'
import type { OrderStatus } from '@/types/api'
import { cx } from '@/utils/cx'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { OrdersTable } from '../components/OrdersTable'

export function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const { data: orders, isPending, isError, error, refetch } = useAdminOrders(status)

  return (
    <>
      <AdminPageHeader title="Orders" description="Most recent first, up to 200 at a time." />
      <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1.5">
        {[undefined, ...orderStatuses].map((value) => (
          <button
            key={value ?? 'all'}
            type="button"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={cx(
              'rounded-full px-3 py-1.5 text-sm ring-1 ring-border-primary transition-colors',
              status === value ? 'bg-neutral-900 text-white ring-neutral-900' : 'bg-primary_alt text-secondary hover:bg-primary_hover',
            )}
          >
            {value ? orderStatusLabel(value) : 'All'}
          </button>
        ))}
      </div>
      {isPending ? <LoadingState label="Loading orders" /> : isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : <OrdersTable orders={orders} />}
    </>
  )
}
