import { useParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { Button } from '@/components/base/buttons/button'
import { useOrder } from '@/features/checkout/hooks'
import { OrderDetails } from '@/features/orders/OrderDetails'
import { useOrderAccessToken } from '@/features/orders/useOrderAccessToken'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'

/**
 * Guest order lookup. The API only answers for the signed-in owner or a holder of the
 * order's private link token, and replies 404 otherwise, so numbers can't be guessed.
 */
export function OrderPage() {
  const { orderNumber = '' } = useParams()
  const token = useOrderAccessToken(orderNumber)
  const { data: order, isPending, isError, error, refetch } = useOrder(orderNumber, token)

  if (isPending) return <LoadingState label="Loading order" className="min-h-[50vh]" />
  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          className="py-32"
          title="We can't show this order"
          description="Use the private link from your confirmation, or sign in to the account you ordered with."
          action={
            <Button href={routePaths.login} size="lg">
              Sign in
            </Button>
          }
        />
      )
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-5xl text-primary">Your order</h1>
      <div className="mt-10">
        <OrderDetails order={order} />
      </div>
    </div>
  )
}
