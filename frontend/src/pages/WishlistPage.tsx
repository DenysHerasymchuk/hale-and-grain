import { ArrowRight } from '@untitledui/icons'
import { Link } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Price } from '@/components/Price/Price'
import { EmptyState } from '@/components/StatusViews/StatusViews'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { routePaths } from '@/Routes/routePaths'

export function WishlistPage({ embedded = false }: { embedded?: boolean }) {
  const items = useWishlistStore((state) => state.items)
  const remove = useWishlistStore((state) => state.remove)

  return (
    <div className={embedded ? undefined : 'container-page py-12 md:py-16'}>
      <h1 className={embedded ? 'font-display text-3xl text-primary' : 'font-display text-5xl text-primary'}>Wishlist</h1>
      {items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on any piece to keep it here while you decide."
          action={
            <Button href={routePaths.products} size="lg" iconTrailing={ArrowRight}>
              Browse the collection
            </Button>
          }
        />
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.productId}>
              <Link to={routePaths.product(item.slug)} className="block overflow-hidden rounded-[var(--radius-card)] bg-secondary">
                {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />}
              </Link>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{item.categoryName}</p>
                  <Link to={routePaths.product(item.slug)} className="mt-1 block font-display text-lg text-primary hover:underline">
                    {item.name}
                  </Link>
                  <Price amount={item.price} currency={item.currency} className="mt-1 block text-sm text-secondary" />
                </div>
                <Button color="link-gray" size="sm" onPress={() => remove(item.productId)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
