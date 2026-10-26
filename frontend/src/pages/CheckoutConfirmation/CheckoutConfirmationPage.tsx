import { CheckCircle } from '@untitledui/icons'
import { useParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useOrder } from '@/features/checkout/hooks'
import { OrderDetails } from '@/features/orders/OrderDetails'
import { useOrderAccessToken } from '@/features/orders/useOrderAccessToken'
import { CheckoutSteps } from '@/pages/Checkout/components/CheckoutSteps'
import { routePaths } from '@/Routes/routePaths'

export function CheckoutConfirmationPage() {
  const { orderNumber = '' } = useParams()
  const token = useOrderAccessToken(orderNumber)
  const { data: order, isPending, isError, error, refetch } = useOrder(orderNumber, token)

  if (isPending) return <LoadingState label="Loading your order" className="min-h-[50vh]" />
  if (isError) return <ErrorState error={error} title="We couldn't open this order" onRetry={() => void refetch()} />

  return (
    <div className="container-page py-12 md:py-16">
      <CheckoutSteps current={3} />
      <div className="mt-10 max-w-2xl">
        <CheckCircle className="size-10 text-fg-success-primary" aria-hidden />
        <h1 className="mt-4 font-display text-5xl text-primary">Thank you, {order.fullName.split(' ')[0]}</h1>
        <p className="mt-4 text-lg text-secondary">
          Order <span className="font-medium text-primary tabular-nums">{order.orderNumber}</span> is in. We&rsquo;ll start making your pieces and email{' '}
          {order.email} with a delivery date.
        </p>
        <p className="mt-3 text-sm text-tertiary">Bookmark this page to check on your order later; the link is private to you.</p>
      </div>
      <div className="mt-12">
        <OrderDetails order={order} />
      </div>
      <Button href={routePaths.products} color="secondary" size="lg" className="mt-12">
        Continue shopping
      </Button>
    </div>
  )
}
