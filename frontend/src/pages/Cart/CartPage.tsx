import { ArrowRight } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { EmptyState } from '@/components/StatusViews/StatusViews'
import { selectItemCount, selectSubtotal, useCartStore } from '@/features/cart/cartStore'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { routePaths } from '@/Routes/routePaths'
import { CartItem } from './components/CartItem'

export function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)

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
            <CartItem key={line.variantId} line={line} />
          ))}
        </ul>

        <OrderSummary
          subtotal={subtotal}
          className="lg:sticky lg:top-32"
          note="Prices and stock are confirmed when you check out. Every piece is made to order and ships in 6–8 weeks."
        >
          <Button href={routePaths.checkout} size="xl" className="w-full" iconTrailing={ArrowRight}>
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
