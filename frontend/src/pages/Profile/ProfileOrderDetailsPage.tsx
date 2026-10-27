import { ArrowLeft } from '@untitledui/icons'
import { Link, useParams } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useAccountOrder } from '@/features/account/hooks'
import { OrderDetails } from '@/features/orders/OrderDetails'
import { routePaths } from '@/Routes/routePaths'

export function ProfileOrderDetailsPage() {
  const { orderNumber = '' } = useParams()
  const { data: order, isPending, isError, error, refetch } = useAccountOrder(orderNumber)

  return (
    <>
      <Link to={routePaths.profileOrders} className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>
      <h1 className="mt-4 font-display text-3xl text-primary">Order {orderNumber}</h1>
      <div className="mt-8">
        {isPending ? (
          <LoadingState label="Loading order" />
        ) : isError ? (
          <ErrorState error={error} title="We couldn't find this order on your account" onRetry={() => void refetch()} />
        ) : (
          <OrderDetails order={order} />
        )}
      </div>
    </>
  )
}
