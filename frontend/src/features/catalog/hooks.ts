import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ProductQuery } from '@/types/api'
import { catalogApi } from './api'

export const catalogKeys = {
  all: ['catalog'] as const,
  products: (query: ProductQuery) => ['catalog', 'products', query] as const,
  product: (slug: string) => ['catalog', 'product', slug] as const,
  related: (slug: string) => ['catalog', 'related', slug] as const,
  categories: ['catalog', 'categories'] as const,
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: catalogKeys.products(query),
    queryFn: ({ signal }) => catalogApi.products(query, signal),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: ({ signal }) => catalogApi.productBySlug(slug, signal),
  })
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: catalogKeys.related(slug),
    queryFn: ({ signal }) => catalogApi.relatedProducts(slug, signal),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: ({ signal }) => catalogApi.categories(signal),
    staleTime: 10 * 60 * 1000,
  })
}
