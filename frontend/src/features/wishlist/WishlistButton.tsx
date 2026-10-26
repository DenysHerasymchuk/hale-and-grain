import { Heart } from '@untitledui/icons'
import { cx } from '@/utils/cx'
import { useWishlistStore, type WishlistEntry } from './wishlistStore'

export function WishlistButton({ entry }: { entry: WishlistEntry }) {
  const saved = useWishlistStore((state) => state.items.some((item) => item.productId === entry.productId))
  const toggle = useWishlistStore((state) => state.toggle)

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${entry.name} from wishlist` : `Save ${entry.name} to wishlist`}
      onClick={() => toggle(entry)}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-border-primary transition-colors hover:bg-secondary"
    >
      <Heart className={cx('size-5 transition-colors', saved ? 'fill-brand-600 text-brand-600' : 'text-secondary')} aria-hidden />
    </button>
  )
}
