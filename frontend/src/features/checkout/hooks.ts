import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCartStore } from '@/features/cart/cartStore'
import { checkoutApi } from './api'

/** Server-side price, stock and delivery for the current cart. */
export function useCartQuote() {
  const lines = useCartStore((state) => state.lines)
  const request = lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity }))

  return useQuery({
    queryKey: ['cart-quote', request],
    queryFn: () => checkoutApi.quote(request),
    enabled: request.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  })
}

export function useOrder(orderNumber: string, token: string | null) {
  return useQuery({
    queryKey: ['order', orderNumber, token],
    queryFn: ({ signal }) => checkoutApi.order(orderNumber, token, signal),
  })
}
