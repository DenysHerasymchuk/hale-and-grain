import { ArrowLeft } from '@untitledui/icons'
import { Link, useParams } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { adminApi, useAdminMutation, useAdminOrder } from '@/features/admin/api'
import { OrderDetails } from '@/features/orders/OrderDetails'
import { orderStatuses, orderStatusLabel } from '@/features/orders/orderLabels'
import type { OrderStatus } from '@/types/api'
import { routePaths } from '@/Routes/routePaths'
import { AdminPageHeader } from './components/AdminPageHeader'
import { SelectField } from './components/Field'

export function AdminOrderDetailsPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, isError, error, refetch } = useAdminOrder(id)
  const updateStatus = useAdminMutation((status: OrderStatus) => adminApi.updateOrderStatus(id, status))

  if (isPending) return <LoadingState label="Loading order" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <Link to={routePaths.adminOrders} className="mb-3 inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Orders
      </Link>
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        actions={
          <SelectField
            label="Status"
            className="w-48"
            value={order.status}
            disabled={updateStatus.isPending}
            onChange={(event) => {
              const next = orderStatuses.find((status) => status === event.target.value)
              if (next) updateStatus.mutate(next)
            }}
            hint={updateStatus.isError ? 'Could not update the status.' : updateStatus.isSuccess ? 'Status updated.' : undefined}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {orderStatusLabel(status)}
              </option>
            ))}
          </SelectField>
        }
      />
      <div className="rounded-xl bg-primary_alt p-5 ring-1 ring-border-secondary md:p-6">
        <OrderDetails order={order} />
      </div>
    </>
  )
}
