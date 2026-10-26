import { api } from '@/lib/apiClient'
import type { Address, Order, OrderSummary, Profile, SaveAddress, WishlistItem } from '@/types/api'

export const accountApi = {
  profile: (signal?: AbortSignal) => api.get<Profile>('/account/profile', signal),
  updateProfile: (profile: Pick<Profile, 'firstName' | 'lastName' | 'marketingEmails'>) => api.put<Profile>('/account/profile', profile),
  addresses: (signal?: AbortSignal) => api.get<Address[]>('/account/addresses', signal),
  createAddress: (address: SaveAddress) => api.post<Address>('/account/addresses', address),
  updateAddress: (id: string, address: SaveAddress) => api.put<Address>(`/account/addresses/${id}`, address),
  deleteAddress: (id: string) => api.delete(`/account/addresses/${id}`),
  orders: (signal?: AbortSignal) => api.get<OrderSummary[]>('/account/orders', signal),
  order: (orderNumber: string, signal?: AbortSignal) => api.get<Order>(`/account/orders/${encodeURIComponent(orderNumber)}`, signal),
  wishlist: (signal?: AbortSignal) => api.get<WishlistItem[]>('/account/wishlist', signal),
  replaceWishlist: (productIds: string[]) => api.put<WishlistItem[]>('/account/wishlist', { productIds }),
  deleteAccount: (password: string) => api.post<void>('/account/delete', { password }),
}
