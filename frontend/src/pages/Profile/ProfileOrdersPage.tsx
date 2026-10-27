import { Link } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useAccountOrders } from '@/features/account/hooks'
import { routePaths } from '@/Routes/routePaths'
import { OrderList } from './components/OrderList'

export function ProfileOrdersPage() {
  const { data: orders, isPending, isError, error, refetch } = useAccountOrders()

  return (
    <>
      <h1 className="font-display text-3xl text-primary">Orders</h1>
      <div className="mt-8">
        {isPending ? (
          <LoadingState label="Loading orders" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : orders.length === 0 ? (
          <p className="text-sm text-tertiary">
            You haven&rsquo;t ordered while signed in yet.{' '}
            <Link to={routePaths.products} className="font-medium text-brand-700 hover:underline">
              Browse the collection
            </Link>
          </p>
        ) : (
          <OrderList orders={orders} />
        )}
      </div>
    </>
  )
}
