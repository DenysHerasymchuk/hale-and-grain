import { api } from '@/lib/apiClient'
import type { CartLineRequest, CheckoutDetails, CreateOrderResponse, Order, Quote } from '@/types/api'

export const checkoutApi = {
  quote: (lines: CartLineRequest[]) => api.post<Quote>('/cart/quote', { lines }),
  createOrder: (details: CheckoutDetails, lines: CartLineRequest[]) => api.post<CreateOrderResponse>('/orders', { ...details, lines }),
  order: (orderNumber: string, token: string | null, signal?: AbortSignal) =>
    api.get<Order>(`/orders/${encodeURIComponent(orderNumber)}${token ? `?token=${encodeURIComponent(token)}` : ''}`, signal),
}
