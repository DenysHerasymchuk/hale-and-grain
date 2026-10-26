import { Check, ShoppingBag01 } from '@untitledui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/base/buttons/button'
import { QuantitySelector } from '@/components/QuantitySelector/QuantitySelector'
import { useCartNotice } from '@/features/cart/cartNotice'
import { lineLimit, useCartStore } from '@/features/cart/cartStore'
import type { ProductDetail, ProductVariant } from '@/types/api'

interface AddToCartProps {
  product: ProductDetail
  variant: ProductVariant
}

export function AddToCart({ product, variant }: AddToCartProps) {
  const add = useCartStore((state) => state.add)
  const showNotice = useCartNotice((state) => state.show)
  const inCart = useCartStore((state) => state.lines.find((line) => line.variantId === variant.id)?.quantity ?? 0)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1600)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  // What is left to add once the cart's existing quantity is counted.
  const remaining = Math.max(0, lineLimit({ available: variant.stock }) - inCart)
  const soldOut = variant.stock === 0
  const quantityToAdd = Math.min(quantity, Math.max(remaining, 1))
  const imageUrl = product.images[0]?.url ?? null

  const addToCart = () => {
    add(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.name,
        sku: variant.sku,
        imageUrl,
        unitPrice: variant.price,
        currency: product.currency,
        available: variant.stock,
      },
      quantityToAdd,
    )
    showNotice({ name: product.name, variantName: variant.name, imageUrl, quantity: quantityToAdd })
    setJustAdded(true)
    setQuantity(1)
  }

  const label = soldOut ? 'Sold out' : justAdded ? 'Added' : remaining === 0 ? 'Maximum in cart' : 'Add to cart'

  return (
    <div className="flex gap-3">
      <QuantitySelector value={quantityToAdd} max={Math.max(remaining, 1)} onChange={setQuantity} isDisabled={soldOut || remaining === 0} />
      <motion.div className="flex-1" whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
        <Button size="xl" className="w-full overflow-hidden" isDisabled={soldOut || (remaining === 0 && !justAdded)} onPress={addToCart}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2"
            >
              {justAdded ? <Check className="size-5" aria-hidden /> : <ShoppingBag01 className="size-5" aria-hidden />}
              {label}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  )
}
