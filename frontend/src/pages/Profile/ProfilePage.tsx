import { Link } from 'react-router'
import { LoadingState } from '@/components/StatusViews/StatusViews'
import { useAccountOrders, useAddresses } from '@/features/account/hooks'
import { countryName } from '@/features/checkout/shippingCountries'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { routePaths } from '@/Routes/routePaths'
import { OrderList } from './components/OrderList'

export function ProfilePage() {
  const { data: orders, isPending: ordersPending } = useAccountOrders()
  const { data: addresses } = useAddresses()
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const defaultAddress = addresses?.find((a) => a.isDefault)

  return (
    <div className="space-y-12">
      <section aria-labelledby="recent-orders">
        <div className="flex items-baseline justify-between">
          <h1 id="recent-orders" className="font-display text-3xl text-primary">
            Recent orders
          </h1>
          <Link to={routePaths.profileOrders} className="text-sm text-secondary hover:underline">
            All orders
          </Link>
        </div>
        <div className="mt-6">
          {ordersPending ? (
            <LoadingState label="Loading orders" />
          ) : orders && orders.length > 0 ? (
            <OrderList orders={orders.slice(0, 3)} />
          ) : (
            <p className="text-sm text-tertiary">
              No orders yet. Orders placed while signed in appear here.{' '}
              <Link to={routePaths.products} className="font-medium text-brand-700 hover:underline">
                Browse the collection
              </Link>
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link to={routePaths.profileAddresses} className="rounded-[var(--radius-card)] border border-secondary p-6 hover:border-primary">
          <h2 className="eyebrow">Default address</h2>
          {defaultAddress ? (
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              {defaultAddress.fullName}
              <br />
              {defaultAddress.line1}, {defaultAddress.postalCode} {defaultAddress.city}
              <br />
              {countryName(defaultAddress.country)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-tertiary">Add an address to check out faster.</p>
          )}
        </Link>
        <Link to={routePaths.profileWishlist} className="rounded-[var(--radius-card)] border border-secondary p-6 hover:border-primary">
          <h2 className="eyebrow">Wishlist</h2>
          <p className="mt-3 font-display text-3xl text-primary">{wishlistCount}</p>
          <p className="text-sm text-tertiary">saved {wishlistCount === 1 ? 'piece' : 'pieces'}</p>
        </Link>
      </div>
    </div>
  )
}
