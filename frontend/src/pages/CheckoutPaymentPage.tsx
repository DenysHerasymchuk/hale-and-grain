import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Lock01 } from '@untitledui/icons'
import { Link, Navigate, useNavigate } from 'react-router'
import { LoadingState } from '@/components/StatusViews/StatusViews'
import { useCartStore } from '@/features/cart/cartStore'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { checkoutApi } from '@/features/checkout/api'
import { useCheckoutStore } from '@/features/checkout/checkoutStore'
import { useCartQuote } from '@/features/checkout/hooks'
import { useOrderAccessStore } from '@/features/checkout/orderAccessStore'
import { countryName } from '@/features/checkout/shippingCountries'
import { ApiError } from '@/lib/apiClient'
import { formatMoney } from '@/lib/formatMoney'
import { CheckoutLines } from '@/pages/Checkout/components/CheckoutLines'
import { CheckoutSteps } from '@/pages/Checkout/components/CheckoutSteps'
import { routePaths } from '@/Routes/routePaths'
import type { Quote } from '@/types/api'
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton'

export function CheckoutPaymentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lines = useCartStore((state) => state.lines)
  const clearCart = useCartStore((state) => state.clear)
  const details = useCheckoutStore((state) => state.details)
  const clearDetails = useCheckoutStore((state) => state.clear)
  const rememberOrder = useOrderAccessStore((state) => state.remember)
  const { data: quote, isPending } = useCartQuote()

  const placeOrder = useMutation({
    mutationFn: () => {
      if (!details) throw new Error('Missing delivery details')
      return checkoutApi.createOrder(details, lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))
    },
    onSuccess: ({ order, accessToken }) => {
      rememberOrder(order.orderNumber, accessToken)
      void Promise.resolve(navigate(`${routePaths.checkoutConfirmation(order.orderNumber)}?token=${encodeURIComponent(accessToken)}`, { replace: true })).then(() => {
        clearCart()
        clearDetails()
      })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
    },
  })

  if (placeOrder.isSuccess) return <LoadingState label="Opening your confirmation" />
  if (lines.length === 0) return <Navigate to={routePaths.cart} replace />
  if (!details) return <Navigate to={routePaths.checkout} replace />

  const conflict = placeOrder.error instanceof ApiError && placeOrder.error.status === 409 && isQuote(placeOrder.error.problem) ? placeOrder.error.problem : null
  const errorMessage = conflict
    ? conflict.problems.map((p) => p.message).join(' ')
    : placeOrder.error instanceof ApiError
      ? placeOrder.error.messages.join(' ')
      : placeOrder.error
        ? 'Something went wrong while placing your order. You have not been charged.'
        : null

  return (
    <div className="container-page py-12 md:py-16">
      <CheckoutSteps current={2} />
      <h1 className="mt-8 font-display text-5xl text-primary">Review and pay</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="max-w-2xl space-y-8">
          <section aria-labelledby="deliver-to" className="rounded-[var(--radius-card)] border border-secondary p-6">
            <div className="flex items-start justify-between">
              <h2 id="deliver-to" className="font-display text-xl text-primary">
                Delivering to
              </h2>
              <Link to={routePaths.checkout} className="text-sm font-medium text-brand-700 hover:underline">
                Edit
              </Link>
            </div>
            <address className="mt-3 text-sm leading-relaxed text-secondary not-italic">
              {details.fullName}
              <br />
              {details.shippingAddress.line1}
              {details.shippingAddress.line2 && (
                <>
                  <br />
                  {details.shippingAddress.line2}
                </>
              )}
              <br />
              {details.shippingAddress.postalCode} {details.shippingAddress.city}, {countryName(details.shippingAddress.country)}
              <br />
              {details.email}
            </address>
          </section>

          <section aria-labelledby="payment-heading" className="rounded-[var(--radius-card)] border border-warning-subtle bg-warning-primary p-6">
            <h2 id="payment-heading" className="flex items-center gap-2 font-display text-xl text-primary">
              <AlertTriangle className="size-5 text-fg-warning-primary" aria-hidden />
              Development checkout
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              No payment provider is connected in this environment, so <strong>no card details are collected and no money is taken</strong>. Placing the
              order reserves stock and records the order with the payment status &ldquo;development, simulated&rdquo;. In production this step hands off to
              the payment provider.
            </p>
          </section>

          {errorMessage && (
            <div role="alert" className="rounded-[var(--radius-card)] border border-error-subtle bg-error-primary p-4 text-sm text-error-primary">
              {errorMessage}{' '}
              {conflict && (
                <Link to={routePaths.cart} className="font-medium underline">
                  Review your cart
                </Link>
              )}
            </div>
          )}

          <PrimaryButton size="lg" iconLeading={Lock01} isLoading={placeOrder.isPending} isDisabled={!quote?.canCheckout} onClick={() => placeOrder.mutate()}>
            {quote ? `Place order · ${formatMoney(quote.total, quote.currency)}` : 'Place order'}
          </PrimaryButton>
        </div>

        {isPending || !quote ? (
          <LoadingState label="Confirming prices" />
        ) : (
          <OrderSummary subtotal={quote.subtotal} shipping={quote.shippingCost} total={quote.total} currency={quote.currency} className="lg:sticky lg:top-32">
            <CheckoutLines lines={quote.lines} currency={quote.currency} />
          </OrderSummary>
        )}
      </div>
    </div>
  )
}

function isQuote(body: unknown): body is Quote {
  return typeof body === 'object' && body !== null && 'problems' in body && Array.isArray(body.problems)
}
