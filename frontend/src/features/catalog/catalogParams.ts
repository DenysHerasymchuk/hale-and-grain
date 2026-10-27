import type { ProductQuery, ProductSort } from '@/types/api'

export const PAGE_SIZE = 12

export const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

const isSort = (value: string | null): value is ProductSort => sortOptions.some((option) => option.value === value)

function readPositiveNumber(params: URLSearchParams, key: string): number | undefined {
  const value = Number(params.get(key))
  return params.has(key) && Number.isFinite(value) && value >= 0 ? value : undefined
}

export function readCatalogParams(params: URLSearchParams): ProductQuery {
  const sort = params.get('sort')
  const page = readPositiveNumber(params, 'page')
  return {
    q: params.get('q')?.trim() || undefined,
    category: params.get('category') || undefined,
    sort: isSort(sort) ? sort : 'featured',
    minPrice: readPositiveNumber(params, 'minPrice'),
    maxPrice: readPositiveNumber(params, 'maxPrice'),
    inStock: params.get('inStock') === 'true' || undefined,
    page: page && page >= 1 ? Math.floor(page) : 1,
    pageSize: PAGE_SIZE,
  }
}

export function updateCatalogParams(params: URLSearchParams, changes: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === '' || value === false || (key === 'sort' && value === 'featured')) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
  }
  if (!('page' in changes)) next.delete('page')
  return next
}
