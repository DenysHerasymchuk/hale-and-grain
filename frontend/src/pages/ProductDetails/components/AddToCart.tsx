import { Check, ShoppingBag01 } from '@untitledui/icons'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { QuantitySelector } from '@/components/QuantitySelector/QuantitySelector'
import { lineLimit, useCartStore } from '@/features/cart/cartStore'
import { routePaths } from '@/Routes/routePaths'
import type { ProductDetail, ProductVariant } from '@/types/api'

interface AddToCartProps {
  product: ProductDetail
  variant: ProductVariant
}

export function AddToCart({ product, variant }: AddToCartProps) {
  const add = useCartStore((state) => state.add)
  const inCart = useCartStore((state) => state.lines.find((line) => line.variantId === variant.id)?.quantity ?? 0)
  const [quantity, setQuantity] = useState(1)
  const [addedSku, setAddedSku] = useState<string | null>(null)

  // What is left to add once the cart's existing quantity is counted.
  const remaining = Math.max(0, lineLimit({ available: variant.stock }) - inCart)
  const soldOut = variant.stock === 0
  const quantityToAdd = Math.min(quantity, Math.max(remaining, 1))

  const addToCart = () => {
    add(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.name,
        sku: variant.sku,
        imageUrl: product.images[0]?.url ?? null,
        unitPrice: variant.price,
        currency: product.currency,
        available: variant.stock,
      },
      quantityToAdd,
    )
    setAddedSku(variant.sku)
    setQuantity(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <QuantitySelector value={quantityToAdd} max={Math.max(remaining, 1)} onChange={setQuantity} isDisabled={soldOut || remaining === 0} />
        <Button size="xl" className="flex-1" iconLeading={ShoppingBag01} isDisabled={soldOut || remaining === 0} onPress={addToCart}>
          {soldOut ? 'Sold out' : remaining === 0 ? 'Maximum in cart' : 'Add to cart'}
        </Button>
      </div>
      <div aria-live="polite" className="min-h-5 text-sm">
        {addedSku === variant.sku && (
          <p className="flex items-center gap-2 text-success-primary">
            <Check className="size-4" aria-hidden />
            Added to your cart.{' '}
            <Link to={routePaths.cart} className="font-medium text-primary underline underline-offset-2">
              View cart
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
