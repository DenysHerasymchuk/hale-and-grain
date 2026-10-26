import { Trash01 } from '@untitledui/icons'
import { Link } from 'react-router'
import { Price } from '@/components/Price/Price'
import { QuantitySelector } from '@/components/QuantitySelector/QuantitySelector'
import { lineLimit, useCartStore, type CartLine } from '@/features/cart/cartStore'
import { routePaths } from '@/Routes/routePaths'

export function CartItem({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((state) => state.setQuantity)
  const remove = useCartStore((state) => state.remove)

  return (
    <li className="flex gap-5 py-6">
      <Link to={`${routePaths.product(line.slug)}?variant=${line.sku}`} className="shrink-0">
        {line.imageUrl ? (
          <img src={line.imageUrl} alt="" className="aspect-[4/5] w-24 rounded-[var(--radius-card)] bg-secondary object-cover sm:w-32" />
        ) : (
          <div className="aspect-[4/5] w-24 rounded-[var(--radius-card)] bg-secondary sm:w-32" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-primary">
              <Link to={`${routePaths.product(line.slug)}?variant=${line.sku}`} className="hover:underline">
                {line.name}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-tertiary">
              {line.variantName} &middot; <span className="tabular-nums">{line.sku}</span>
            </p>
          </div>
          <Price amount={line.unitPrice * line.quantity} currency={line.currency} className="font-medium text-primary" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <QuantitySelector
            size="sm"
            label={`Quantity of ${line.name}`}
            value={line.quantity}
            max={lineLimit(line)}
            onChange={(quantity) => setQuantity(line.variantId, quantity)}
          />
          <button
            type="button"
            onClick={() => remove(line.variantId)}
            className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-error-primary"
            aria-label={`Remove ${line.name}, ${line.variantName} from cart`}
          >
            <Trash01 className="size-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
