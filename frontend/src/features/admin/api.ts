import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, toQueryString } from '@/lib/apiClient'
import type { Order, OrderStatus } from '@/types/api'
import type {
  AdminCategory,
  AdminCategoryInput,
  AdminOrderListItem,
  AdminProduct,
  AdminProductInput,
  AdminProductListItem,
  Customer,
  Dashboard,
  InventoryItem,
  StoreSettings,
} from './types'

// Every call here is authorised by the API's Admin role; the route guard only hides the UI.
export const adminApi = {
  dashboard: (signal?: AbortSignal) => api.get<Dashboard>('/admin/dashboard', signal),
  products: (q: string, signal?: AbortSignal) => api.get<AdminProductListItem[]>(`/admin/products${toQueryString({ q })}`, signal),
  product: (id: string, signal?: AbortSignal) => api.get<AdminProduct>(`/admin/products/${id}`, signal),
  createProduct: (input: AdminProductInput) => api.post<AdminProduct>('/admin/products', input),
  updateProduct: (id: string, input: AdminProductInput) => api.put<AdminProduct>(`/admin/products/${id}`, input),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  categories: (signal?: AbortSignal) => api.get<AdminCategory[]>('/admin/categories', signal),
  createCategory: (input: AdminCategoryInput) => api.post<AdminCategory>('/admin/categories', input),
  updateCategory: (id: string, input: AdminCategoryInput) => api.put<AdminCategory>(`/admin/categories/${id}`, input),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  inventory: (signal?: AbortSignal) => api.get<InventoryItem[]>('/admin/inventory', signal),
  updateStock: (variantId: string, stock: number) => api.put<void>(`/admin/inventory/${variantId}`, { stock }),
  // Query-string enums bind case-sensitively on the API ("Pending"), unlike JSON bodies ("pending").
  orders: (status: OrderStatus | undefined, signal?: AbortSignal) =>
    api.get<AdminOrderListItem[]>(`/admin/orders${toQueryString({ status: status && status[0]?.toUpperCase() + status.slice(1) })}`, signal),
  order: (id: string, signal?: AbortSignal) => api.get<Order>(`/admin/orders/${id}`, signal),
  updateOrderStatus: (id: string, status: OrderStatus) => api.put<void>(`/admin/orders/${id}/status`, { status }),
  customers: (q: string, signal?: AbortSignal) => api.get<Customer[]>(`/admin/customers${toQueryString({ q })}`, signal),
  settings: (signal?: AbortSignal) => api.get<StoreSettings>('/admin/settings', signal),
  updateSettings: (settings: StoreSettings) => api.put<StoreSettings>('/admin/settings', settings),
}

const keys = {
  all: ['admin'] as const,
  dashboard: ['admin', 'dashboard'] as const,
  products: (q: string) => ['admin', 'products', q] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  categories: ['admin', 'categories'] as const,
  inventory: ['admin', 'inventory'] as const,
  orders: (status?: OrderStatus) => ['admin', 'orders', status ?? 'all'] as const,
  order: (id: string) => ['admin', 'order', id] as const,
  customers: (q: string) => ['admin', 'customers', q] as const,
  settings: ['admin', 'settings'] as const,
}

export const useDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: ({ signal }) => adminApi.dashboard(signal) })
export const useAdminProducts = (q: string) => useQuery({ queryKey: keys.products(q), queryFn: ({ signal }) => adminApi.products(q, signal) })
export const useAdminProduct = (id: string | undefined) =>
  useQuery({ queryKey: keys.product(id ?? 'new'), queryFn: ({ signal }) => adminApi.product(id ?? '', signal), enabled: Boolean(id) })
export const useAdminCategories = () => useQuery({ queryKey: keys.categories, queryFn: ({ signal }) => adminApi.categories(signal) })
export const useInventory = () => useQuery({ queryKey: keys.inventory, queryFn: ({ signal }) => adminApi.inventory(signal) })
export const useAdminOrders = (status?: OrderStatus) => useQuery({ queryKey: keys.orders(status), queryFn: ({ signal }) => adminApi.orders(status, signal) })
export const useAdminOrder = (id: string) => useQuery({ queryKey: keys.order(id), queryFn: ({ signal }) => adminApi.order(id, signal) })
export const useCustomers = (q: string) => useQuery({ queryKey: keys.customers(q), queryFn: ({ signal }) => adminApi.customers(q, signal) })
export const useStoreSettings = () => useQuery({ queryKey: keys.settings, queryFn: ({ signal }) => adminApi.settings(signal) })

/**
 * Admin writes touch prices, stock and copy the storefront shows, so after any change we
 * drop both the admin caches and the public catalogue cache.
 */
export function useAdminMutation<TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: keys.all }), queryClient.invalidateQueries({ queryKey: ['catalog'] })]),
  })
}
