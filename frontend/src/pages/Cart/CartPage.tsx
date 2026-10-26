import { AlertCircle, ArrowRight } from '@untitledui/icons'
import { useEffect } from 'react'
import { Button } from '@/components/base/buttons/button'
import { EmptyState } from '@/components/StatusViews/StatusViews'
import { selectItemCount, selectSubtotal, useCartStore } from '@/features/cart/cartStore'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { useCartQuote } from '@/features/checkout/hooks'
import { routePaths } from '@/Routes/routePaths'
import { CartItem } from './components/CartItem'

export function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)
  const syncPrices = useCartStore((state) => state.syncPrices)
  const { data: quote, isError: quoteFailed } = useCartQuote()

  useEffect(() => {
    if (quote) syncPrices(quote.lines.map((l) => ({ variantId: l.variantId, unitPrice: l.unitPrice, available: l.available })))
  }, [quote, syncPrices])

  const problems = quote?.problems ?? []

  if (lines.length === 0) {
    return (
      <div className="container-page">
        <EmptyState
          className="py-32"
          title="Your cart is empty"
          description="Find a piece you love, turn it around in 3D, and it will wait for you here."
          action={
            <Button href={routePaths.products} size="lg" iconTrailing={ArrowRight}>
              Browse the collection
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-5xl text-primary">Your cart</h1>
      <p className="mt-2 text-tertiary">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-start">
        <ul aria-label="Cart items" className="divide-y divide-border-secondary border-y border-secondary">
          {lines.map((line) => (
            <CartItem key={line.variantId} line={line} problem={problems.find((p) => p.variantId === line.variantId)?.message} />
          ))}
        </ul>

        <OrderSummary
          subtotal={quote?.subtotal ?? subtotal}
          shipping={quote?.shippingCost}
          total={quote?.total}
          className="lg:sticky lg:top-32"
          note={
            quoteFailed
              ? 'We could not confirm current prices just now. They will be checked again at checkout.'
              : 'Every piece is made to order and ships in 6–8 weeks. Free delivery on orders over €750.'
          }
        >
          {problems.length > 0 && (
            <p role="alert" className="mb-4 flex gap-2 text-sm text-error-primary">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Some items need your attention before checkout.
            </p>
          )}
          <Button href={routePaths.checkout} size="xl" className="w-full" iconTrailing={ArrowRight} isDisabled={problems.length > 0}>
            Continue to checkout
          </Button>
          <Button href={routePaths.products} size="lg" color="link-gray" className="mt-4 w-full justify-center">
            Continue shopping
          </Button>
        </OrderSummary>
      </div>
    </div>
  )
}
