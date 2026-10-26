import { api, toQueryString } from '@/lib/apiClient'
import type { Category, PagedResult, ProductDetail, ProductQuery, ProductSummary } from '@/types/api'

export const catalogApi = {
  products: (query: ProductQuery, signal?: AbortSignal) =>
    api.get<PagedResult<ProductSummary>>(`/products${toQueryString(query)}`, signal),
  productBySlug: (slug: string, signal?: AbortSignal) =>
    api.get<ProductDetail>(`/products/slug/${encodeURIComponent(slug)}`, signal),
  relatedProducts: (slug: string, signal?: AbortSignal) =>
    api.get<ProductSummary[]>(`/products/slug/${encodeURIComponent(slug)}/related`, signal),
  categories: (signal?: AbortSignal) => api.get<Category[]>('/categories', signal),
}
